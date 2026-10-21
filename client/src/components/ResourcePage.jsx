import {useEffect,useState} from 'react';import {motion} from 'framer-motion';import {Plus,Trash2,Search,RefreshCw,Pencil,X} from 'lucide-react';
import {useApi} from '../hooks/useApi.js';import {api} from '../services/api.js';import {useApp} from '../context/AppContext.jsx';

function EnrollmentSelect({path,labelKey,secondaryKey,value,onChange}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    api(path).then(result=>{
      if(active)setItems(result?.data||[]);
    }).catch(e=>{
      if(active)setError(e.message);
    }).finally(()=>{
      if(active)setLoading(false);
    });
    return ()=>{active=false;};
  },[path]);
  return <>
    <select required value={value} onChange={e=>onChange(e.target.value)} disabled={loading||!!error}>
      <option value="">{loading?'Loading...':error?'Could not load options':'Select...'}</option>
      {items.map(item=><option key={item._id} value={item._id}>
        {[item[labelKey],item[secondaryKey]].filter(Boolean).join(' — ')}
      </option>)}
    </select>
    {error&&<small className="muted">{error}. Admin login may be required for courses.</small>}
  </>;
}

export default function ResourcePage({mod}){
  const {t,user}=useApp();const [q,setQ]=useState('');const [open,setOpen]=useState(false);const [form,setForm]=useState({});const [err,setErr]=useState('');const [editingId,setEditingId]=useState(null);
  const {data,loading,error,reload}=useApi('/'+mod.path,{q});const rows=data?.data||[];
  const formFields=mod.path==='submissions'&&editingId?mod.fields.filter(f=>f.name==='content'):mod.path==='submissions'?mod.fields.filter(f=>['assignmentId','content'].includes(f.name)):mod.path==='attendance'&&editingId?mod.fields.filter(f=>['date','status'].includes(f.name)):mod.path==='grades'&&editingId?mod.fields.filter(f=>['assessment','marksObtained','maxMarks'].includes(f.name)):mod.fields;
  const submit=async e=>{e.preventDefault();setErr('');try{await api(editingId?`/${mod.path}/${editingId}`:'/'+mod.path,{method:editingId?'PATCH':'POST',body:form});setForm({});setEditingId(null);setOpen(false);reload();}catch(x){setErr(x.message);}};
  const edit=r=>{setEditingId(r._id||r.id);setForm(mod.path==='attendance'?{date:String(r.date||'').slice(0,10),status:r.status||''}:mod.path==='grades'?{assessment:r.assessment||'',marksObtained:r.marksObtained??'',maxMarks:r.maxMarks??''}:mod.path==='timetable'?{day:r.day||'',period:r.period??'',courseId:r.courseId?._id||r.courseId||'',room:r.room||''}:mod.path==='assignments'?{title:r.title||'',course:r.course?._id||r.course||'',dueDate:String(r.dueDate||'').slice(0,10),description:r.description||''}:mod.path==='submissions'?{content:r.content||''}:mod.path==='fees/ledger'?{studentId:r.studentId?._id||r.studentId||'',description:r.description||'',amount:r.amount??'',type:r.type||''}:Object.fromEntries(mod.fields.map(f=>[f.name,r[f.name]??''])));setOpen(true);setErr('');};
  const cancelEdit=()=>{setEditingId(null);setForm({});setOpen(false);setErr('');};
  const del=async id=>{if(!confirm('Delete this record?'))return;try{await api(`/${mod.path}/${id}`,{method:'DELETE'});reload();}catch(x){setErr(x.message);}};
  const set=(f,v)=>setForm({...form,[f.name]:f.type==='number'?Number(v):v});
  return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="glass pad">
    <div className="row"><h2>{t(mod.key)}</h2><span className="grow"/>
      <label className="input sm"><Search size={14}/><input placeholder="Filter" value={q} onChange={e=>setQ(e.target.value)}/></label>
      <button className="btn ghost" onClick={reload} aria-label="Refresh"><RefreshCw size={14}/></button>
      {!mod.readOnly&&(mod.path==='fees/ledger'?user?.role==='admin':mod.path!=='submissions'||user?.role==='student')&&<button className="btn" onClick={()=>{if(open){cancelEdit();}else{setForm({});setEditingId(null);setOpen(true);}}}><Plus size={14}/>{t('add')}</button>}</div>
    {open&&<form onSubmit={submit} className="grid2">{formFields.map(f=><label key={f.name} className="fld">{f.label}
      {mod.path==='fees/ledger'&&f.name==='studentId'?<EnrollmentSelect path="/students" labelKey="name" secondaryKey="rollNo" value={form.studentId||''} onChange={v=>setForm({...form,studentId:v})}/>:mod.path==='submissions'&&f.name==='assignmentId'?<EnrollmentSelect path="/assignments" labelKey="title" secondaryKey="dueDate" value={form.assignmentId||''} onChange={v=>setForm({...form,assignmentId:v})}/>
      :['enrollments','attendance','grades'].includes(mod.path)&&f.name==='student'?<EnrollmentSelect path="/students" labelKey="name" secondaryKey="rollNo" value={form.student||''} onChange={v=>setForm({...form,student:v})}/>
      :mod.path==='timetable'&&f.name==='courseId'?<EnrollmentSelect path="/courses" labelKey="title" secondaryKey="code" value={form.courseId||''} onChange={v=>setForm({...form,courseId:v})}/>:['enrollments','attendance','grades','assignments'].includes(mod.path)&&f.name==='course'?<EnrollmentSelect path="/courses" labelKey="title" secondaryKey="code" value={form.course||''} onChange={v=>setForm({...form,course:v})}/>
      :f.type==='select'?<select required value={form[f.name]||''} onChange={e=>set(f,e.target.value)}><option value="">—</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>
      :f.type==='textarea'?<textarea value={form[f.name]||''} onChange={e=>set(f,e.target.value)}/>
      :<input required type={f.type} value={form[f.name]??''} onChange={e=>set(f,e.target.value)}/>}</label>)}
      <button className="btn">{editingId?'Save Changes':t('save')}</button>{editingId&&<button type="button" className="btn ghost" onClick={cancelEdit}><X size={14}/>Cancel</button>}</form>}
    {(err||error)&&<div className="alert">{err||error} <button className="link" onClick={reload}>{t('retry')}</button></div>}
    {loading?<div className="skeleton"/>:!error&&(rows.length===0?<p className="muted">{t('empty')}</p>:
    <div className="scroll"><table><thead><tr>{mod.fields.map(f=><th key={f.name}>{f.label}</th>)}<th/></tr></thead>
      <tbody>{rows.map(r=><tr key={r._id||r.id}>{mod.fields.map(f=><td key={f.name}>{String(f.name==='assignmentId'&&mod.path==='submissions'?(r.assignment?.title||''):f.name==='student'&&mod.path==='submissions'?(r.student?.name||r.student?.rollNo||''):f.name==='submittedAt'&&mod.path==='submissions'?(r.submittedAt?new Date(r.submittedAt).toLocaleString():''):(r[f.name]&&typeof r[f.name]==='object'?(r[f.name].name||r[f.name].title||r[f.name].code||r[f.name]._id||''):(r[f.name]??'')))}</td>)}
        <td>{!mod.readOnly&&(mod.path!=='fees/ledger'||user?.role==='admin')&&<div className="row">{(mod.path==='fees/ledger'?user?.role==='admin':mod.path==='submissions'?user?.role==='student':['students','faculty','departments','courses','attendance','grades','assignments','timetable','announcements','calendar-events','library','library/books','documents','tickets'].includes(mod.path))&&<button className="btn ghost" onClick={()=>edit(r)} aria-label="Edit record" title="Edit record"><Pencil size={14}/></button>}{mod.path!=='submissions'&&<button className="btn ghost" onClick={()=>del(r._id||r.id)} aria-label="Delete"><Trash2 size={14}/></button>}</div>}</td></tr>)}</tbody></table></div>)}
  </motion.div>;
}
