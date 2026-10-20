import mongoose from 'mongoose';import {opts,ref,ObjectId,appendOnly} from './_helpers.js';
const s=new mongoose.Schema({
  actorId:ref('User'),actorRole:{type:String,enum:['admin','faculty','student','anonymous','system'],required:true},
  action:{type:String,required:true,match:/^[a-z_]+\.[a-z_]+$/}, // e.g. grade.update, document.download
  resourceType:{type:String,maxlength:40},resourceId:ObjectId,studentId:ref('StudentProfile'), // studentId = whose private record was touched
  outcome:{type:String,enum:['success','denied','error'],required:true},
  ip:{type:String,maxlength:64},userAgent:{type:String,maxlength:300},requestId:{type:String,maxlength:64},
  changes:{type:mongoose.Schema.Types.Mixed}, // REDACTED before/after of changed fields; never passwords, tokens or file bytes
  at:{type:Date,default:Date.now}
},opts({timestamps:false}));
s.index({resourceType:1,resourceId:1,at:-1});s.index({actorId:1,at:-1});s.index({studentId:1,at:-1});s.index({action:1,at:-1});
appendOnly(s);
export default mongoose.model('AuditLog',s);
