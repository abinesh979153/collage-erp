import mongoose from 'mongoose';import {opts,ref} from './_helpers.js';
const s=new mongoose.Schema({
  bookId:ref('Book',true),borrowerId:ref('User',true),issuedById:ref('User',true),issuedAt:{type:Date,default:Date.now},
  dueAt:{type:Date,required:true,validate:{validator(v){return v>this.issuedAt;},message:'dueAt must be after issuedAt'}},
  returnedAt:Date,status:{type:String,enum:['issued','returned','lost'],default:'issued'},
  renewals:{type:Number,default:0,min:0,max:2},fineMinor:{type:Number,default:0,min:0,validate:Number.isInteger}
},opts());
s.index({bookId:1,borrowerId:1},{unique:true,partialFilterExpression:{status:'issued'}}); // no duplicate active loan of a title
s.index({borrowerId:1,status:1});s.index({status:1,dueAt:1});
export default mongoose.model('BookIssue',s);
