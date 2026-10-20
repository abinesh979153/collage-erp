// Pure validation tests: no database connection needed. Run: npm test
import test from 'node:test';import assert from 'node:assert/strict';import mongoose from 'mongoose';
import * as M from '../src/models/index.js';import {toMinor} from '../src/services/money.js';import {can,scopeFilter} from '../src/access/policies.js';
const id=()=>new mongoose.Types.ObjectId();const bad=(doc,path)=>assert.ok(doc.validateSync()?.errors[path],`expected ${path} to be invalid`);
test('roll number format',()=>bad(new M.StudentProfile({userId:id(),rollNo:'abc',departmentId:id(),program:'BE',admissionYear:2026}),'rollNo'));
test('attendance date format',()=>bad(new M.AttendanceRecord({enrollmentId:id(),studentId:id(),sectionId:id(),courseId:id(),date:'12/10/2026',status:'present',markedById:id()}),'date'));
test('marks cannot exceed maxMarks',()=>bad(new M.Grade({enrollmentId:id(),studentId:id(),sectionId:id(),courseId:id(),maxMarks:50,marks:60,gradedById:id()}),'marks'));
test('payment requires method',()=>bad(new M.FeeLedgerEntry({studentId:id(),term:'2026-27-ODD',type:'payment',direction:'credit',description:'x',amountMinor:100,recordedById:id()}),'method'));
test('charge must be a debit',()=>bad(new M.FeeLedgerEntry({studentId:id(),term:'2026-27-ODD',type:'charge',direction:'credit',description:'x',amountMinor:100,recordedById:id()}),'direction'));
test('book copiesAvailable <= copiesTotal',()=>bad(new M.Book({title:'t',author:'a',copiesTotal:1,copiesAvailable:2}),'copiesAvailable'));
test('section enrolledCount <= capacity',()=>bad(new M.Section({courseId:id(),term:'2026-27-ODD',name:'A',facultyId:id(),capacity:2,enrolledCount:3}),'enrolledCount'));
test('unknown fields are rejected (mass assignment)',()=>assert.throws(()=>new M.User({email:'a@b.example',isAdmin:true})));
test('Document has no url field',()=>assert.equal(M.Document.schema.path('url'),undefined));
test('enrollment unique indexes exist',()=>{const ix=M.Enrollment.schema.indexes();assert.ok(ix.some(([k,o])=>k.studentId&&k.sectionId&&o.unique));assert.ok(ix.some(([k,o])=>k.courseId&&o.partialFilterExpression));});
test('money conversion',()=>{assert.equal(toMinor(199.99),19999);assert.throws(()=>toMinor(1.005));assert.throws(()=>toMinor(-5));});
test('policy: deny by default and self scope',()=>{assert.equal(can('student','grades','update'),false);assert.equal(can('faculty','fees','read'),false);assert.deepEqual(scopeFilter({role:'student',profileId:'p1'},'attendance'),{studentId:'p1'});});
