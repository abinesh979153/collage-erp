// Central, deny-by-default authorization matrix. Express middleware must call can() AND apply scopeFilter() to every query.
const CRUD=['create','read','update','delete'];
const P=(admin,faculty,student)=>({admin,faculty,student});
const a=(actions,scope)=>({actions,scope});
export const POLICY={
  users:P(a(CRUD,'all'),null,null),
  students:P(a(CRUD,'all'),a(['read'],'taughtSections'),a(['read'],'self')),
  faculty:P(a(CRUD,'all'),a(['read'],'self'),a(['read'],'all')),
  departments:P(a(CRUD,'all'),a(['read'],'all'),a(['read'],'all')),
  courses:P(a(CRUD,'all'),a(['read'],'all'),a(['read'],'all')),
  sections:P(a(CRUD,'all'),a(['read','update'],'taughtSections'),a(['read'],'enrolledSections')),
  enrollments:P(a(CRUD,'all'),a(['read'],'taughtSections'),a(['read'],'self')),
  attendance:P(a(CRUD,'all'),a(['create','read','update'],'taughtSections'),a(['read'],'self')),
  grades:P(a(CRUD,'all'),a(['create','read','update'],'taughtSections'),a(['read'],'selfPublished')),
  assignments:P(a(CRUD,'all'),a(CRUD,'taughtSections'),a(['read'],'enrolledSections')),
  submissions:P(a(['read','update'],'all'),a(['read','update'],'taughtSections'),a(['create','read','update'],'self')),
  timetable:P(a(CRUD,'all'),a(['read'],'taughtSections'),a(['read'],'enrolledSections')),
  calendar:P(a(CRUD,'all'),a(['read'],'audience'),a(['read'],'audience')),
  library:P(a(CRUD,'all'),a(['read'],'all'),a(['read'],'all')),
  libraryIssues:P(a(CRUD,'all'),a(['read'],'self'),a(['read'],'self')),
  fees:P(a(['create','read'],'all'),null,a(['read'],'self')),
  announcements:P(a(CRUD,'all'),a(['create','read','update'],'ownOrAudience'),a(['read'],'audience')),
  notifications:P(a(['read','update'],'self'),a(['read','update'],'self'),a(['read','update'],'self')),
  documents:P(a(['read','delete'],'all'),a(['create','read','delete'],'self'),a(['create','read','delete'],'self')),
  tickets:P(a(CRUD,'all'),a(['create','read','update'],'self'),a(['create','read','update'],'self')),
  achievements:P(a(CRUD,'all'),a(['read','update'],'taughtSections'),a(['create','read','update'],'self')),
  auditLogs:P(a(['read'],'all'),null,null),
  reports:P(a(['read'],'all'),a(['read'],'taughtSections'),null),
};
export const can=(role,resource,action)=>Boolean(POLICY[resource]?.[role]?.actions.includes(action));
// user = {role, profileId, userId, sectionIds:[...]} loaded server-side from the session (never from the request body).
const SELF_FIELD={students:'_id',enrollments:'studentId',attendance:'studentId',grades:'studentId',submissions:'studentId',fees:'studentId',achievements:'studentId',documents:'ownerId',tickets:'requesterId',notifications:'recipientId',libraryIssues:'borrowerId'};
export function scopeFilter(user,resource){
  const rule=POLICY[resource]?.[user.role];
  if(!rule) return {_id:{$exists:false}}; // matches nothing
  const f=SELF_FIELD[resource]||'_id';
  const self=resource==='documents'||resource==='tickets'||resource==='notifications'||resource==='libraryIssues'?user.userId:user.profileId;
  switch(rule.scope){
    case 'all': return {};
    case 'self': return {[f]:self};
    case 'selfPublished': return {studentId:user.profileId,published:true};
    case 'taughtSections':
    case 'enrolledSections': return {sectionId:{$in:user.sectionIds||[]}};
    default: return {}; // 'audience' / 'ownOrAudience' are applied by resource-specific code
  }
}
