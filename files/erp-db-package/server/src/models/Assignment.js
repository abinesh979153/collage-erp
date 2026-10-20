import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  title:{type:String,required:true,trim:true,minlength:3,maxlength:200},description:{type:String,maxlength:5000},
  courseId:ref('Course',true),sectionId:ref('Section',true),facultyId:ref('FacultyProfile',true),
  dueDate:{type:Date,required:true},maxMarks:{type:Number,default:100,min:1,max:1000},allowLate:{type:Boolean,default:false},
  attachmentIds:{type:[ref('Document')],validate:v=>v.length<=5},status:{type:String,enum:['draft','published','closed'],default:'published'}
},opts());
s.index({sectionId:1,dueDate:1});s.index({facultyId:1,status:1});
export default mongoose.model('Assignment',s);
