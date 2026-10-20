import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  title:{type:String,required:true,trim:true,minlength:3,maxlength:200},body:{type:String,required:true,trim:true,maxlength:5000},
  audience:{type:String,enum:['all','students','faculty'],default:'all'},departmentIds:{type:[ref('Department')],validate:v=>v.length<=20},
  authorId:ref('User',true),status:{type:String,enum:['draft','published','archived'],default:'published'},
  publishAt:{type:Date,default:Date.now},
  expiresAt:{type:Date,validate:{validator(v){return !v||!this.publishAt||v>this.publishAt;},message:'expiresAt must be after publishAt'}},
  pinned:{type:Boolean,default:false}
},opts());
s.index({status:1,audience:1,publishAt:-1});
export default mongoose.model('Announcement',s);
