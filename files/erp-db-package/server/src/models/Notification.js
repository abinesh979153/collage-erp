import mongoose from 'mongoose';import {opts,ref,ObjectId} from './_helpers.js';
// Server-generated only; clients can list and mark as read, never create.
const s=new mongoose.Schema({
  recipientId:ref('User',true),message:{type:String,required:true,trim:true,maxlength:500},
  type:{type:String,enum:['announcement','grade','assignment','fee','ticket','library','system'],default:'system'},
  link:{resource:{type:String,maxlength:40},id:ObjectId},readAt:Date
},opts({timestamps:{createdAt:true,updatedAt:false}}));
s.index({recipientId:1,readAt:1,createdAt:-1});
s.index({createdAt:1},{expireAfterSeconds:60*60*24*180}); // auto-purge after 180 days
export default mongoose.model('Notification',s);
