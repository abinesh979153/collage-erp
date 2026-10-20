import mongoose from 'mongoose';import {opts,ref,termField,dateStr,appendOnly} from './_helpers.js';
// Append-only double-direction ledger. No mutable balance: balance = SUM(debit) - SUM(credit). Mistakes are fixed by a
// 'reversal' entry. Payments are RECORDED by staff (cash/bank/UPI reference). No payment gateway is integrated.
const DIR={charge:'debit',payment:'credit',waiver:'credit'};
const s=new mongoose.Schema({
  studentId:ref('StudentProfile',true),term:termField(),
  type:{type:String,enum:['charge','payment','waiver','adjustment','reversal'],required:true},
  direction:{type:String,enum:['debit','credit'],required:true,validate:{validator(v){return !DIR[this.type]||DIR[this.type]===v;},message:'direction does not match type'}},
  category:{type:String,enum:['tuition','hostel','exam','transport','library_fine','other'],default:'other'},
  description:{type:String,required:true,trim:true,minlength:1,maxlength:200},
  amountMinor:{type:Number,required:true,min:1,max:100000000,validate:Number.isInteger}, // integer paise, always positive
  currency:{type:String,enum:['INR'],default:'INR'},dueDate:dateStr(false),
  method:{type:String,enum:['cash','bank_transfer','upi','cheque','other'],required:function(){return this.type==='payment';}},
  reference:{type:String,trim:true,maxlength:80},receiptNo:String,idempotencyKey:{type:String,maxlength:80},
  reversalOf:{...ref('FeeLedgerEntry'),required:function(){return this.type==='reversal';}},
  recordedById:ref('User',true)
},opts({timestamps:{createdAt:true,updatedAt:false}}));
s.index({studentId:1,createdAt:-1});s.index({studentId:1,term:1,type:1});
s.index({receiptNo:1},{unique:true,partialFilterExpression:{receiptNo:{$type:'string'}}});
s.index({studentId:1,idempotencyKey:1},{unique:true,partialFilterExpression:{idempotencyKey:{$type:'string'}}});
s.index({reversalOf:1},{unique:true,partialFilterExpression:{reversalOf:{$type:'objectId'}}}); // an entry can be reversed once
appendOnly(s);
export default mongoose.model('FeeLedgerEntry',s);
