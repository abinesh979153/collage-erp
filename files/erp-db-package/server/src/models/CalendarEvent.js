import mongoose from 'mongoose';import {opts,ref,dateStr} from './_helpers.js';
const s=new mongoose.Schema({
  title:{type:String,required:true,trim:true,minlength:3,maxlength:200},description:{type:String,maxlength:2000},
  type:{type:String,enum:['exam','holiday','event','deadline'],required:true},
  date:dateStr(),endDate:{type:String,match:/^\d{4}-\d{2}-\d{2}$/,validate:{validator(v){return !v||v>=this.date;},message:'endDate must be on/after date'}},
  audience:{type:String,enum:['all','students','faculty'],default:'all'},departmentIds:[ref('Department')],createdById:ref('User',true)
},opts());
s.index({date:1,endDate:1});s.index({type:1,date:1});
export default mongoose.model('CalendarEvent',s);
