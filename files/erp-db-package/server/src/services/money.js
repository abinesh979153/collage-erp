import {AppError} from './errors.js';
// API uses decimal rupees (max 2 dp); storage uses integer paise to avoid float errors.
export function toMinor(amount){
  if(typeof amount!=='number'||!Number.isFinite(amount)||amount<=0) throw new AppError(422,'VALIDATION_ERROR','amount must be a positive number');
  const minor=Math.round(amount*100);
  if(Math.abs(minor/100-amount)>1e-9) throw new AppError(422,'VALIDATION_ERROR','amount allows at most 2 decimal places');
  return minor;
}
export const toMajor=minor=>minor/100;
