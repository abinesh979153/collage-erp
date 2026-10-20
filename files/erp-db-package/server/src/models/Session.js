import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
// The browser holds an opaque random token in an httpOnly cookie; only HMAC-SHA256(token, SESSION_TOKEN_PEPPER) is stored.
const s=new mongoose.Schema({
  userId:ref('User',true),tokenHash:{type:String,required:true,unique:true,match:/^[a-f0-9]{64}$/},
  ip:{type:String,maxlength:64},userAgent:{type:String,maxlength:300},lastSeenAt:{type:Date,default:Date.now},
  expiresAt:{type:Date,required:true},revokedAt:Date
},opts({timestamps:{createdAt:true,updatedAt:false}}));
s.index({expiresAt:1},{expireAfterSeconds:0}); // TTL: Mongo deletes expired sessions
s.index({userId:1,revokedAt:1});
export default mongoose.model('Session',s);
