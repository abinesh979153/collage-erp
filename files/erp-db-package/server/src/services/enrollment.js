import StudentProfile from '../models/StudentProfile.js';import Section from '../models/Section.js';import Course from '../models/Course.js';import Enrollment from '../models/Enrollment.js';
import {AppError} from './errors.js';import {enrollmentClashes} from './timetable.js';
// Single-document-atomic design: the seat is claimed with a conditional $inc, so this is safe WITHOUT a replica set.
// If Enrollment.create fails, the seat is released (compensation). Use a transaction only if you need all-or-nothing.
export async function enrollStudent({studentId,sectionId}){
  const student=await StudentProfile.findById(studentId);
  if(!student||student.status!=='active') throw new AppError(422,'INVALID_ENROLLMENT','Student not found or not active');
  const section=await Section.findById(sectionId);
  if(!section||section.status!=='open') throw new AppError(422,'INVALID_ENROLLMENT','Section not found or not open');
  const course=await Course.findById(section.courseId);
  if(!course||!course.isActive) throw new AppError(422,'INVALID_ENROLLMENT','Course is not active');
  if(course.prerequisiteIds.length){
    const done=await Enrollment.countDocuments({studentId,courseId:{$in:course.prerequisiteIds},status:'completed'});
    if(done<course.prerequisiteIds.length) throw new AppError(422,'PREREQUISITE_NOT_MET','Prerequisites not completed');
  }
  const clashes=await enrollmentClashes(studentId,sectionId,section.term);
  if(clashes.length) throw new AppError(409,'TIMETABLE_CLASH','Section clashes with the student\'s timetable',{clashes:clashes.map(c=>({type:'student',slotId:c._id}))});
  const claimed=await Section.findOneAndUpdate({_id:sectionId,status:'open',$expr:{$lt:['$enrolledCount','$capacity']}},{$inc:{enrolledCount:1}},{new:true});
  if(!claimed) throw new AppError(409,'SECTION_FULL','Section is full');
  try{return await Enrollment.create({studentId,sectionId,courseId:section.courseId,term:section.term});}
  catch(e){
    await Section.updateOne({_id:sectionId},{$inc:{enrolledCount:-1}});
    if(e.code===11000) throw new AppError(409,'ALREADY_ENROLLED','Student already enrolled in this section/course for the term');
    throw e;
  }
}
export async function dropEnrollment(enrollmentId){
  const e=await Enrollment.findOneAndUpdate({_id:enrollmentId,status:'enrolled'},{status:'dropped',droppedAt:new Date()},{new:true});
  if(!e) throw new AppError(409,'NOT_ENROLLED','Enrollment is not active');
  await Section.updateOne({_id:e.sectionId,enrolledCount:{$gt:0}},{$inc:{enrolledCount:-1}});
  return e;
}
