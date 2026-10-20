import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  userId:{...ref('User',true),unique:true},
  rollNo:{type:String,required:true,unique:true,uppercase:true,trim:true,match:[/^\d{4}[A-Z]{2,6}-\d{4}$/,'e.g. 2026CSE-0001']},
  departmentId:ref('Department',true),
  program:{type:String,required:true,enum:['BE','BTech','BSc','BCom','BA','ME','MTech','MBA','MSc']},
  admissionYear:{type:Number,required:true,min:2000,max:2100},
  currentYear:{type:Number,min:1,max:6,default:1},
  currentSemester:{type:Number,min:1,max:12,default:1},
  dob:Date,guardianName:{type:String,trim:true,maxlength:120},guardianPhone:{type:String,trim:true,match:/^\+?[0-9 ()-]{7,20}$/},
  status:{type:String,enum:['active','graduated','suspended','withdrawn'],default:'active'}
},opts());
s.index({departmentId:1,currentYear:1,status:1});
export default mongoose.model('StudentProfile',s);
