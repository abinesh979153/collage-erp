import mongoose from 'mongoose';
export async function connect(){
  const uri=process.env.MONGODB_URI;
  if(!uri) throw new Error('MONGODB_URI is not set (copy server/.env.example to server/.env)');
  mongoose.set('strictQuery',true);
  mongoose.set('sanitizeFilter',true); // blocks $-operator injection from request-supplied filters
  await mongoose.connect(uri,{dbName:process.env.MONGODB_DB_NAME,serverSelectionTimeoutMS:5000,autoIndex:process.env.NODE_ENV!=='production'});
  return mongoose.connection;
}
// Multi-document transactions need a replica set member or mongos; standalone mongod rejects them.
export async function supportsTransactions(){
  const h=await mongoose.connection.db.admin().command({hello:1});
  return Boolean(h.setName||h.msg==='isdbgrid');
}
