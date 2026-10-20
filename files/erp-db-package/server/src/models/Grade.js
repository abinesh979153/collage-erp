import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  enrollmentId:ref('Enrollment',true),studentId:ref('StudentProfile',true),sectionId:ref('Section',true),courseId:ref('Course',true),
  component:{type:String,enum:['internal1','internal2','assignment','midterm','practical','final'],default:'final'},
  maxMarks:{type:Number,default:100,min:1,max:1000},
  marks:{type:Number,required:true,min:0,validate:{validator(v){return v<=this.maxMarks;},message:'marks exceed maxMarks'}},
  grade:{type:String,enum:['O','A+','A','B+','B','C','P','F','AB']},gradePoints:{type:Number,min:0,max:10},
  published:{type:Boolean,default:false},publishedAt:Date,gradedById:ref('User',true)
},opts());
s.index({enrollmentId:1,component:1},{unique:true});s.index({studentId:1,published:1});s.index({sectionId:1,component:1});
export default mongoose.model('Grade',s);
