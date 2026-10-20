import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  userId:{...ref('User',true),unique:true},
  employeeId:{type:String,required:true,unique:true,uppercase:true,trim:true,match:[/^FAC-\d{4}$/,'e.g. FAC-0001']},
  departmentId:ref('Department',true),
  designation:{type:String,required:true,enum:['Professor','Associate Professor','Assistant Professor','Lecturer','Lab Instructor']},
  specializations:{type:[String],validate:v=>v.length<=10},
  joinedOn:Date,status:{type:String,enum:['active','on_leave','retired','resigned'],default:'active'}
},opts());
s.index({departmentId:1,status:1});
export default mongoose.model('FacultyProfile',s);
