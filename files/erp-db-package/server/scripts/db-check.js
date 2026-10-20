import 'dotenv/config';import mongoose from 'mongoose';import {connect,supportsTransactions} from '../src/config/db.js';
try{
  const c=await connect();await c.db.admin().ping();
  console.log(`OK: connected to database "${c.name}" on ${c.host}`);
  console.log(`Transactions supported (replica set/mongos): ${await supportsTransactions()}`);
}catch(e){console.error('FAILED to connect:',e.message);process.exitCode=1;}
finally{await mongoose.disconnect();}
