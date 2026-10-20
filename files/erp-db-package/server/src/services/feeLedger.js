import mongoose from 'mongoose';import FeeLedgerEntry from '../models/FeeLedgerEntry.js';import {AppError} from './errors.js';import {toMinor} from './money.js';import {nextReceiptNo} from './identifiers.js';
export async function balanceMinor(studentId){
  const [r]=await FeeLedgerEntry.aggregate([{$match:{studentId:new mongoose.Types.ObjectId(String(studentId))}},
    {$group:{_id:null,debit:{$sum:{$cond:[{$eq:['$direction','debit']},'$amountMinor',0]}},credit:{$sum:{$cond:[{$eq:['$direction','credit']},'$amountMinor',0]}}}}]);
  return r?r.debit-r.credit:0; // positive = student owes money
}
export const addCharge=({studentId,term,category,description,amount,dueDate,recordedById})=>
  FeeLedgerEntry.create({studentId,term,type:'charge',direction:'debit',category,description,amountMinor:toMinor(amount),dueDate,recordedById});
// Records money already received offline (cash/bank/UPI ref). No gateway call is made. Idempotent via idempotencyKey.
export async function recordPayment({studentId,term,amount,method,reference,idempotencyKey,recordedById}){
  const amountMinor=toMinor(amount);
  if(amountMinor>await balanceMinor(studentId)) throw new AppError(409,'OVERPAYMENT','Payment exceeds outstanding balance');
  try{return await FeeLedgerEntry.create({studentId,term,type:'payment',direction:'credit',description:'Payment received',amountMinor,method,reference,idempotencyKey,receiptNo:await nextReceiptNo(),recordedById});}
  catch(e){if(e.code===11000&&idempotencyKey) return FeeLedgerEntry.findOne({studentId,idempotencyKey});throw e;}
}
export async function reverseEntry({entryId,reason,recordedById}){
  const o=await FeeLedgerEntry.findById(entryId);
  if(!o) throw new AppError(404,'NOT_FOUND','Entry not found');
  if(o.type==='reversal') throw new AppError(409,'CONFLICT','A reversal cannot be reversed');
  try{return await FeeLedgerEntry.create({studentId:o.studentId,term:o.term,type:'reversal',direction:o.direction==='debit'?'credit':'debit',category:o.category,description:`Reversal: ${reason}`.slice(0,200),amountMinor:o.amountMinor,reversalOf:o._id,recordedById});}
  catch(e){if(e.code===11000) throw new AppError(409,'ALREADY_REVERSED','Entry already reversed');throw e;}
}
