import 'dotenv/config';import mongoose from 'mongoose';import {connect} from '../src/config/db.js';import * as M from '../src/models/index.js';
try{
  await connect();
  for(const [name,model] of Object.entries(M)){ if(typeof model?.syncIndexes!=='function') continue; await model.syncIndexes(); console.log('indexes synced:',name); }
}catch(e){console.error('FAILED:',e.message);process.exitCode=1;}
finally{await mongoose.disconnect();}
