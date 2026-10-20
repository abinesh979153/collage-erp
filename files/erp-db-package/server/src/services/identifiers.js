import Counter from '../models/Counter.js';
const pad=(n,w)=>String(n).padStart(w,'0');
export const nextRollNo=async(year,deptCode)=>`${year}${deptCode}-${pad(await Counter.next(`roll:${year}${deptCode}`),4)}`;
export const nextEmployeeId=async()=>`FAC-${pad(await Counter.next('employee'),4)}`;
export const nextReceiptNo=async()=>`RCT-${new Date().getUTCFullYear()}-${pad(await Counter.next('receipt'),6)}`;
export const nextTicketNo=async()=>`TCK-${pad(await Counter.next('ticket'),6)}`;
