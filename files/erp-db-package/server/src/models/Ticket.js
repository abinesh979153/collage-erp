import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const reply=new mongoose.Schema({authorId:ref('User',true),body:{type:String,required:true,maxlength:5000},internal:{type:Boolean,default:false},at:{type:Date,default:Date.now}},{strict:'throw'});
const s=new mongoose.Schema({
  ticketNo:{type:String,required:true,unique:true,match:/^TCK-\d{6}$/},requesterId:ref('User',true),
  subject:{type:String,required:true,trim:true,minlength:3,maxlength:150},message:{type:String,required:true,trim:true,maxlength:5000},
  priority:{type:String,enum:['low','medium','high'],default:'medium'},category:{type:String,enum:['academic','fees','library','it','other'],default:'other'},
  status:{type:String,enum:['open','in_progress','resolved','closed'],default:'open'},assignedToId:ref('User'),
  replies:{type:[reply],validate:v=>v.length<=200},resolvedAt:Date
},opts());
s.index({requesterId:1,status:1,createdAt:-1});s.index({status:1,priority:1,createdAt:-1});s.index({assignedToId:1,status:1});
export default mongoose.model('Ticket',s);
