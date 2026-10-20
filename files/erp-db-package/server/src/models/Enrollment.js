import mongoose from 'mongoose';import {opts,ref,termField} from './_helpers.js';
const s=new mongoose.Schema({
  studentId:ref('StudentProfile',true),sectionId:ref('Section',true),courseId:ref('Course',true),term:termField(),
  status:{type:String,enum:['enrolled','dropped','completed','failed','withdrawn'],default:'enrolled'},
  enrolledAt:{type:Date,default:Date.now},droppedAt:Date
},opts());
s.index({studentId:1,sectionId:1},{unique:true});
// one ACTIVE enrollment per student per course per term (two sections of the same course are invalid)
s.index({studentId:1,courseId:1,term:1},{unique:true,partialFilterExpression:{status:'enrolled'}});
s.index({sectionId:1,status:1});
export default mongoose.model('Enrollment',s);
