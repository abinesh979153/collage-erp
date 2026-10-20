import TimetableSlot from '../models/TimetableSlot.js';import Section from '../models/Section.js';import Enrollment from '../models/Enrollment.js';
import {AppError} from './errors.js';
// Server-side clash rules for one (term, day, period). Checked: section, faculty, room, and shared students.
// The first three are ALSO enforced by unique indexes (race-proof). The student check is best-effort (not atomic).
export async function findClashes({sectionId,facultyId,room,term,day,period,excludeId}){
  const base={term,day,period,...(excludeId?{_id:{$ne:excludeId}}:{})};
  const [sec,fac,rm]=await Promise.all([TimetableSlot.findOne({...base,sectionId}),TimetableSlot.findOne({...base,facultyId}),TimetableSlot.findOne({...base,room})]);
  const out=[];
  if(sec) out.push({type:'section',slotId:sec._id});
  if(fac) out.push({type:'faculty',slotId:fac._id});
  if(rm) out.push({type:'room',slotId:rm._id});
  const roster=await Enrollment.distinct('studentId',{sectionId,status:'enrolled'});
  if(roster.length){
    const otherSections=await Enrollment.distinct('sectionId',{studentId:{$in:roster},status:'enrolled',term,sectionId:{$ne:sectionId}});
    const st=otherSections.length?await TimetableSlot.findOne({...base,sectionId:{$in:otherSections}}):null;
    if(st) out.push({type:'student',slotId:st._id});
  }
  return out;
}
export async function createSlot({sectionId,day,period,room}){
  const section=await Section.findById(sectionId);
  if(!section||section.status==='archived') throw new AppError(422,'INVALID_SECTION','Section not found or archived');
  const doc={sectionId,day,period,room,courseId:section.courseId,facultyId:section.facultyId,term:section.term};
  const clashes=await findClashes(doc);
  if(clashes.length) throw new AppError(409,'TIMETABLE_CLASH','Timetable clash detected',{clashes});
  try{return await TimetableSlot.create(doc);}
  catch(e){if(e.code===11000) throw new AppError(409,'TIMETABLE_CLASH','Timetable clash detected (concurrent write)');throw e;}
}
// Used when enrolling: would the student's existing slots collide with the target section's slots?
export async function enrollmentClashes(studentId,sectionId,term){
  const mine=await Enrollment.distinct('sectionId',{studentId,status:'enrolled',term});
  if(!mine.length) return [];
  const target=await TimetableSlot.find({sectionId});
  if(!target.length) return [];
  return TimetableSlot.find({sectionId:{$in:mine},$or:target.map(t=>({day:t.day,period:t.period}))});
}
