import mongoose from 'mongoose';import {opts,ref,termField} from './_helpers.js';
const s=new mongoose.Schema({
  courseId:ref('Course',true),term:termField(),
  name:{type:String,required:true,uppercase:true,trim:true,match:/^[A-Z0-9]{1,4}$/},
  facultyId:ref('FacultyProfile',true),
  capacity:{type:Number,required:true,min:1,max:300,validate:Number.isInteger},
  enrolledCount:{type:Number,default:0,min:0,validate:{validator(v){return Number.isInteger(v)&&v<=this.capacity;},message:'enrolledCount exceeds capacity'}},
  room:{type:String,trim:true,maxlength:30},
  status:{type:String,enum:['open','closed','archived'],default:'open'}
},opts());
s.index({courseId:1,term:1,name:1},{unique:true});s.index({facultyId:1,term:1});
export default mongoose.model('Section',s);
