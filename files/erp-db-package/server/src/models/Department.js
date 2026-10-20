import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  code:{type:String,required:true,unique:true,uppercase:true,trim:true,match:/^[A-Z]{2,6}$/},
  name:{type:String,required:true,unique:true,trim:true,maxlength:120},
  headId:ref('FacultyProfile'),isActive:{type:Boolean,default:true}
},opts());
export default mongoose.model('Department',s);
