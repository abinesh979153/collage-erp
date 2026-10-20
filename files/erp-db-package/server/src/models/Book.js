import mongoose from 'mongoose';import {opts} from './_helpers.js';
const s=new mongoose.Schema({
  title:{type:String,required:true,trim:true,minlength:1,maxlength:250},author:{type:String,required:true,trim:true,maxlength:150},
  isbn:{type:String,trim:true,match:[/^(\d{9}[\dX]|\d{13})$/,'ISBN-10/13 digits only, no hyphens']},
  category:{type:String,trim:true,maxlength:60},shelf:{type:String,trim:true,maxlength:30},
  copiesTotal:{type:Number,required:true,min:0,validate:Number.isInteger},
  copiesAvailable:{type:Number,required:true,min:0,validate:{validator(v){return Number.isInteger(v)&&v<=this.copiesTotal;},message:'copiesAvailable exceeds copiesTotal'}},
  status:{type:String,enum:['active','retired'],default:'active'}
},opts());
s.index({isbn:1},{unique:true,partialFilterExpression:{isbn:{$type:'string'}}});s.index({title:'text',author:'text'});
export default mongoose.model('Book',s);
