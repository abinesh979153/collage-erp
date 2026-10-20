// FICTIONAL demo data only. Safe-by-default: refuses to run unless every guard passes.
import 'dotenv/config';import crypto from 'node:crypto';import argon2 from 'argon2';import mongoose from 'mongoose';
import {connect} from '../config/db.js';import * as M from '../models/index.js';
import {nextRollNo,nextEmployeeId,nextTicketNo} from '../services/identifiers.js';
import {enrollStudent} from '../services/enrollment.js';import {createSlot} from '../services/timetable.js';
import {addCharge,recordPayment} from '../services/feeLedger.js';
const args=new Set(process.argv.slice(2));const die=m=>{console.error('SEED REFUSED: '+m);process.exit(1);};
if(process.env.NODE_ENV==='production') die('NODE_ENV=production');
if(process.env.ALLOW_SEED!=='true') die('set ALLOW_SEED=true in server/.env (development only)');
if(!/(_dev|_test|_local)$/.test(process.env.MONGODB_DB_NAME||'')) die('MONGODB_DB_NAME must end with _dev, _test or _local');
if(/mongodb\+srv:|\.mongodb\.net/.test(process.env.MONGODB_URI||'')&&!args.has('--allow-remote')) die('URI looks like a hosted cluster; pass --allow-remote only for a throwaway dev cluster');
const password=process.env.SEED_PASSWORD||crypto.randomBytes(12).toString('base64url');
if(password.length<12) die('SEED_PASSWORD must be at least 12 characters');
const TERM='2026-27-ODD',DOMAIN='college.example'; // .example is reserved (RFC 2606): addresses can never be real
const conn=await connect();
try{
  if(args.has('--reset')){ for(const m of Object.values(M)) if(m?.collection) await m.collection.deleteMany({}); console.log(`Cleared collections in "${conn.name}"`); }
  else if(await M.User.estimatedDocumentCount()>0) die('database already has users; use --reset to wipe this dev database first');
  const hash=await argon2.hash(password,{type:argon2.argon2id});
  const mk=(role,name,email)=>M.User.create({role,name,email:`${email}@${DOMAIN}`,passwordHash:hash,status:'active'});
  const admin=await mk('admin','Demo Admin','demo.admin');
  const [cse,ece]=await M.Department.create([{code:'CSE',name:'Computer Science and Engineering'},{code:'ECE',name:'Electronics and Communication'}]);
  const fac=[];
  for(const [i,d] of [[1,cse],[2,cse],[3,ece]]){
    const u=await mk('faculty',`Demo Faculty ${i}`,`demo.faculty${i}`);
    fac.push(await M.FacultyProfile.create({userId:u._id,employeeId:await nextEmployeeId(),departmentId:d._id,designation:'Assistant Professor'}));
  }
  await M.Department.updateOne({_id:cse._id},{headId:fac[0]._id});
  const stu=[];
  for(let i=1;i<=6;i++){
    const d=i<=4?cse:ece,u=await mk('student',`Demo Student ${String(i).padStart(2,'0')}`,`demo.student${String(i).padStart(2,'0')}`);
    stu.push(await M.StudentProfile.create({userId:u._id,rollNo:await nextRollNo(2026,d.code),departmentId:d._id,program:'BE',admissionYear:2026}));
  }
  const courses=await M.Course.create([{code:'CSE101',title:'Programming Fundamentals',departmentId:cse._id,credits:4},{code:'CSE102',title:'Discrete Mathematics',departmentId:cse._id,credits:3},{code:'ECE101',title:'Basic Electronics',departmentId:ece._id,credits:3}]);
  const secs=await M.Section.create(courses.map((c,i)=>({courseId:c._id,term:TERM,name:'A',facultyId:fac[i]._id,capacity:60,room:`R-10${i+1}`})));
  for(const s of stu) for(const sec of secs.filter((x,i)=>i<2===(s.departmentId.equals(cse._id))||i===2&&!s.departmentId.equals(cse._id))) await enrollStudent({studentId:s._id,sectionId:sec._id});
  await createSlot({sectionId:secs[0]._id,day:'Mon',period:1,room:'R-101'});
  await createSlot({sectionId:secs[1]._id,day:'Mon',period:2,room:'R-102'});
  await createSlot({sectionId:secs[2]._id,day:'Tue',period:1,room:'R-103'});
  const enr=await M.Enrollment.find({sectionId:secs[0]._id});
  await M.AttendanceRecord.create(enr.map((e,i)=>({enrollmentId:e._id,studentId:e.studentId,sectionId:e.sectionId,courseId:e.courseId,date:'2026-10-12',period:1,status:i%3===2?'absent':'present',markedById:admin._id})));
  await M.Grade.create(enr.map((e,i)=>({enrollmentId:e._id,studentId:e.studentId,sectionId:e.sectionId,courseId:e.courseId,component:'internal1',maxMarks:50,marks:30+i*3,gradedById:admin._id,published:true,publishedAt:new Date()})));
  const asg=await M.Assignment.create({title:'Lab 1: Variables and Loops',description:'Fictional assignment.',courseId:courses[0]._id,sectionId:secs[0]._id,facultyId:fac[0]._id,dueDate:new Date('2026-11-05T18:29:00Z')});
  await M.Submission.create({assignmentId:asg._id,studentId:stu[0]._id,sectionId:secs[0]._id,content:'Demo submission text.'});
  await M.Announcement.create({title:'Welcome to the demo term',body:'This is fictional seed data.',authorId:admin._id});
  await M.CalendarEvent.create([{title:'Internal Assessment 1',type:'exam',date:'2026-11-16',endDate:'2026-11-20',createdById:admin._id},{title:'Demo Holiday',type:'holiday',date:'2026-11-08',createdById:admin._id}]);
  await M.Notification.create({recipientId:(await M.User.findById(stu[0].userId))._id,message:'Your internal assessment mark was published.',type:'grade'});
  const [bk]=await M.Book.create([{title:'Introduction to Algorithms (demo copy)',author:'Fictional Author',isbn:'9780000000002',copiesTotal:3,copiesAvailable:3}]);
  await M.Book.updateOne({_id:bk._id,copiesAvailable:{$gt:0}},{$inc:{copiesAvailable:-1}});
  await M.BookIssue.create({bookId:bk._id,borrowerId:stu[0].userId,issuedById:admin._id,dueAt:new Date(Date.now()+14*864e5)});
  await addCharge({studentId:stu[0]._id,term:TERM,category:'tuition',description:'Tuition fee (demo)',amount:50000,dueDate:'2026-11-30',recordedById:admin._id});
  await recordPayment({studentId:stu[0]._id,term:TERM,amount:20000,method:'bank_transfer',reference:'DEMO-REF-0001',idempotencyKey:'seed-pay-1',recordedById:admin._id});
  await M.Ticket.create({ticketNo:await nextTicketNo(),requesterId:stu[1].userId,subject:'Cannot see my timetable',message:'Demo ticket.'});
  await M.Achievement.create({studentId:stu[0]._id,title:'Inter-department quiz finalist (demo)',category:'academic',date:'2026-09-20'});
  await M.AuditLog.create({actorId:admin._id,actorRole:'admin',action:'seed.run',outcome:'success'});
  console.log(`Seed complete in "${conn.name}". Login: demo.admin@${DOMAIN} / demo.student01@${DOMAIN} / demo.faculty1@${DOMAIN}`);
  console.log(process.env.SEED_PASSWORD?'Password: the SEED_PASSWORD you set.':`Generated password (shown once, dev only): ${password}`);
}catch(e){console.error('Seed failed:',e.message);process.exitCode=1;}
finally{await mongoose.disconnect();}
