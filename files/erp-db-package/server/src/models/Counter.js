import mongoose from 'mongoose';
const s=new mongoose.Schema({_id:{type:String,required:true},seq:{type:Number,default:0}},{versionKey:false,strict:'throw'});
// Atomic, gap-tolerant sequence generator (used for roll numbers, receipt numbers, ticket numbers).
s.statics.next=async function(key){const d=await this.findOneAndUpdate({_id:key},{$inc:{seq:1}},{new:true,upsert:true});return d.seq;};
export default mongoose.model('Counter',s);
