import mongoose from 'mongoose';import {opts} from './_helpers.js';
export const ROLES=['admin','faculty','student'];
const s=new mongoose.Schema({
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,maxlength:254,match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/},
  passwordHash:{type:String,required:true,select:false},
  role:{type:String,enum:ROLES,required:true,index:true},
  name:{type:String,required:true,trim:true,minlength:2,maxlength:120},
  phone:{type:String,trim:true,match:/^\+?[0-9 ()-]{7,20}$/},
  status:{type:String,enum:['pending','active','suspended'],default:'pending',index:true},
  failedLoginCount:{type:Number,default:0,min:0},lockUntil:Date,lastLoginAt:Date,passwordChangedAt:Date,
  mustChangePassword:{type:Boolean,default:false}
},opts());
s.index({name:'text',email:'text'});
export default mongoose.model('User',s);
