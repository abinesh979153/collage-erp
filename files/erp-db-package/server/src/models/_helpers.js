import mongoose from 'mongoose';
import {PERIODS} from '../config/periods.js';
const {Schema}=mongoose;
export const ObjectId=Schema.Types.ObjectId;
export const ref=(to,required=false)=>({type:ObjectId,ref:to,required});
export const DATE_RE=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const TERM_RE=/^\d{4}-\d{2}-(ODD|EVEN)$/;
export const dateStr=(required=true)=>({type:String,required,match:[DATE_RE,'Use YYYY-MM-DD']});
export const termField=()=>({type:String,required:true,match:[TERM_RE,'Use e.g. 2026-27-ODD']});
export const isInt=v=>Number.isInteger(v);
export const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat'];
export const MAX_PERIOD=Object.keys(PERIODS).length;
const HIDE=['passwordHash','storageKey','failedLoginCount','lockUntil','tokenHash'];
const strip=(_d,r)=>{HIDE.forEach(k=>delete r[k]);return r;};
// strict:'throw' rejects unknown fields (mass-assignment guard); timestamps on by default.
export const opts=(extra={})=>({timestamps:true,versionKey:false,strict:'throw',toJSON:{transform:strip},...extra});
export function appendOnly(schema){
  const block=function(next){next(new Error('This collection is append-only'));};
  ['updateOne','updateMany','findOneAndUpdate','findOneAndReplace','replaceOne','deleteMany','findOneAndDelete'].forEach(op=>schema.pre(op,block));
  schema.pre('deleteOne',{document:true,query:true},block);
  schema.pre('save',function(next){next(this.isNew?undefined:new Error('This collection is append-only'));});
}
