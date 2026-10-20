import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  assignmentId:ref('Assignment',true),studentId:ref('StudentProfile',true),sectionId:ref('Section',true),
  content:{type:String,maxlength:20000,validate:{validator(v){return Boolean(v)||(this.attachmentIds&&this.attachmentIds.length>0);},message:'Provide content or an attachment'}},
  attachmentIds:{type:[ref('Document')],validate:v=>v.length<=5},
  submittedAt:{type:Date,default:Date.now},isLate:{type:Boolean,default:false},version:{type:Number,default:1,min:1},
  status:{type:String,enum:['submitted','graded','returned'],default:'submitted'},
  marks:{type:Number,min:0},feedback:{type:String,maxlength:2000},gradedById:ref('User'),gradedAt:Date
},opts());
s.index({assignmentId:1,studentId:1},{unique:true}); // resubmission bumps `version`, never creates a duplicate
s.index({studentId:1,submittedAt:-1});
export default mongoose.model('Submission',s);
