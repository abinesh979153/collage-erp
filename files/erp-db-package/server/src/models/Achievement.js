import mongoose from 'mongoose';import {opts,ref,dateStr} from './_helpers.js';
const s=new mongoose.Schema({
  studentId:ref('StudentProfile',true),title:{type:String,required:true,trim:true,minlength:3,maxlength:200},
  category:{type:String,enum:['academic','sports','cultural','research','community','other'],default:'other'},
  date:dateStr(),description:{type:String,maxlength:2000},evidenceDocumentId:ref('Document'),
  status:{type:String,enum:['pending','verified','rejected'],default:'pending'},verifiedById:ref('User'),verifiedAt:Date
},opts());
s.index({studentId:1,date:-1});s.index({status:1});
export default mongoose.model('Achievement',s);
