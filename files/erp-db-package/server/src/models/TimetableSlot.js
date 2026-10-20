import mongoose from 'mongoose';import {opts,ref,termField,DAYS,MAX_PERIOD} from './_helpers.js';
// courseId/facultyId/term are DERIVED from the section by the server (never trusted from the client).
const s=new mongoose.Schema({
  sectionId:ref('Section',true),courseId:ref('Course',true),facultyId:ref('FacultyProfile',true),term:termField(),
  day:{type:String,enum:DAYS,required:true},period:{type:Number,required:true,min:1,max:MAX_PERIOD,validate:Number.isInteger},
  room:{type:String,required:true,trim:true,maxlength:30},notes:{type:String,maxlength:200}
},opts());
// DB-level backstops for the server-side clash check (services/timetable.js)
s.index({sectionId:1,term:1,day:1,period:1},{unique:true});
s.index({facultyId:1,term:1,day:1,period:1},{unique:true});
s.index({room:1,term:1,day:1,period:1},{unique:true});
export default mongoose.model('TimetableSlot',s);
