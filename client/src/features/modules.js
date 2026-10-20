// Module config drives list/create/delete screens. Endpoints: GET/POST /api/v1/<path>, DELETE /api/v1/<path>/:id
const F=(name,label,type='text',options)=>({name,label,type,options});
export const modules=[
 {key:'students',path:'students',roles:['admin','faculty'],fields:[F('name','Name'),F('rollNo','Roll No'),F('email','Email','email'),F('department','Department'),F('year','Year','number')]},
 {key:'faculty',path:'faculty',roles:['admin'],fields:[F('name','Name'),F('email','Email','email'),F('department','Department'),F('designation','Designation')]},
 {key:'departments',path:'departments',roles:['admin'],fields:[F('name','Name'),F('code','Code'),F('head','Head')]},
 {key:'courses',path:'courses',roles:['admin','faculty','student'],fields:[F('code','Code'),F('title','Title'),F('department','Department'),F('credits','Credits','number')]},
 {key:'enrollments',path:'enrollments',roles:['admin','faculty','student'],fields:[F('student','Student ID'),F('course','Course ID'),F('semester','Semester')]},
 {key:'attendance',path:'attendance',roles:['admin','faculty','student'],fields:[F('student','Student ID'),F('course','Course ID'),F('date','Date','date'),F('status','Status','select',['present','absent','late'])]},
 {key:'grades',path:'grades',roles:['admin','faculty','student'],fields:[F('studentId','Student ID'),F('courseId','Course ID'),F('marks','Marks','number'),F('grade','Grade')]},
 {key:'assignments',path:'assignments',roles:['admin','faculty','student'],fields:[F('title','Title'),F('courseId','Course ID'),F('dueDate','Due','date'),F('description','Description','textarea')]},
 {key:'submissions',path:'submissions',roles:['faculty','student'],fields:[F('assignmentId','Assignment ID'),F('content','Answer / link','textarea')]},
 {key:'timetable',path:'timetable',roles:['admin','faculty','student'],fields:[F('day','Day','select',['Mon','Tue','Wed','Thu','Fri','Sat']),F('period','Period'),F('courseId','Course ID'),F('room','Room')]},
 {key:'calendar',path:'calendar-events',roles:['admin','faculty','student'],fields:[F('title','Event'),F('date','Date','date'),F('type','Type','select',['exam','holiday','event'])]},
 {key:'library',path:'library/books',roles:['admin','faculty','student'],fields:[F('title','Title'),F('author','Author'),F('isbn','ISBN'),F('copies','Copies','number')]},
 {key:'fees',path:'fees/ledger',roles:['admin','student'],fields:[F('studentId','Student ID'),F('description','Description'),F('amount','Amount','number'),F('type','Type','select',['charge','payment'])]},
 {key:'announcements',path:'announcements',roles:['admin','faculty','student'],fields:[F('title','Title'),F('body','Message','textarea'),F('audience','Audience','select',['all','students','faculty'])]},
 {key:'notifications',path:'notifications',roles:['admin','faculty','student'],readOnly:true,fields:[F('message','Message')]},
 {key:'documents',path:'documents',roles:['admin','faculty','student'],fields:[F('name','Name'),F('category','Category'),F('url','File URL')]},
 {key:'tickets',path:'tickets',roles:['admin','faculty','student'],fields:[F('subject','Subject'),F('priority','Priority','select',['low','medium','high']),F('message','Details','textarea')]},
];
