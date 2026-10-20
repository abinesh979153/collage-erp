import mongoose from 'mongoose';import {opts,ref,dateStr,MAX_PERIOD} from './_helpers.js';
const s=new mongoose.Schema({
  enrollmentId:ref('Enrollment',true),studentId:ref('StudentProfile',true),sectionId:ref('Section',true),courseId:ref('Course',true),
  date:dateStr(),period:{type:Number,default:0,min:0,max:MAX_PERIOD,validate:Number.isInteger}, // 0 = whole-session record
  status:{type:String,enum:['present','absent','late','excused'],required:true},
  markedById:ref('User',true),remarks:{type:String,maxlength:200}
},opts());
s.index({enrollmentId:1,date:1,period:1},{unique:true}); // one mark per student, section, day, period
s.index({sectionId:1,date:1,period:1});s.index({studentId:1,date:1});
export default mongoose.model('AttendanceRecord',s);
