import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  code:{type:String,required:true,unique:true,uppercase:true,trim:true,match:/^[A-Z]{2,6}\d{3}$/},
  title:{type:String,required:true,trim:true,minlength:3,maxlength:150},
  departmentId:ref('Department',true),
  credits:{type:Number,required:true,min:1,max:10,validate:Number.isInteger},
  level:{type:String,enum:['ug','pg'],default:'ug'},
  description:{type:String,maxlength:2000},
  prerequisiteIds:{type:[ref('Course')],validate:v=>v.length<=8},
  isActive:{type:Boolean,default:true}
},opts());
s.index({departmentId:1,isActive:1});s.index({title:'text',code:'text'});
export default mongoose.model('Course',s);
