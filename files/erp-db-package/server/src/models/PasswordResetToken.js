import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  userId:ref('User',true),tokenHash:{type:String,required:true,unique:true,match:/^[a-f0-9]{64}$/},
  expiresAt:{type:Date,required:true},usedAt:Date
},opts({timestamps:{createdAt:true,updatedAt:false}}));
s.index({expiresAt:1},{expireAfterSeconds:0});s.index({userId:1});
export default mongoose.model('PasswordResetToken',s);
