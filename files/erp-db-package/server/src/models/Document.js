import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
// METADATA ONLY. Bytes live in private storage (PRIVATE_UPLOAD_DIR or a private bucket) under an opaque storageKey.
// There is intentionally NO url field: files are served only by GET /documents/:id/download after an authz check.
const s=new mongoose.Schema({
  ownerId:ref('User',true),studentId:ref('StudentProfile'),
  name:{type:String,required:true,trim:true,minlength:1,maxlength:200},
  category:{type:String,enum:['id_proof','marksheet','certificate','fee_receipt','bonafide','assignment','other'],default:'other'},
  accessLevel:{type:String,enum:['private','staff_visible'],default:'private'},
  storageKey:{type:String,required:true,unique:true,select:false,match:/^[a-f0-9]{32,64}$/},
  originalName:{type:String,required:true,maxlength:255},
  mimeType:{type:String,required:true,enum:['application/pdf','image/jpeg','image/png']},
  sizeBytes:{type:Number,required:true,min:1,max:10485760,validate:Number.isInteger},
  sha256:{type:String,required:true,match:/^[a-f0-9]{64}$/},
  scanStatus:{type:String,enum:['pending','clean','infected','failed'],default:'pending'},deletedAt:Date
},opts());
s.index({ownerId:1,category:1,createdAt:-1});s.index({studentId:1});s.index({sha256:1});
export default mongoose.model('Document',s);
