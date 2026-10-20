import {useState} from 'react';import {motion} from 'framer-motion';import {Plus,Trash2,Search,RefreshCw} from 'lucide-react';
import {useApi} from '../hooks/useApi.js';import {api} from '../services/api.js';import {useApp} from '../context/AppContext.jsx';
export default function ResourcePage({mod}){
  const {t}=useApp();const [q,setQ]=useState('');const [open,setOpen]=useState(false);const [form,setForm]=useState({});const [err,setErr]=useState('');
  const {data,loading,error,reload}=useApi('/'+mod.path,{q});const rows=data?.data||[];
  const submit=async e=>{e.preventDefault();setErr('');try{await api('/'+mod.path,{method:'POST',body:form});setForm({});setOpen(false);reload();}catch(x){setErr(x.message);}};
  const del=async id=>{if(!confirm('Delete this record?'))return;try{await api(`/${mod.path}/${id}`,{method:'DELETE'});reload();}catch(x){setErr(x.message);}};
  const set=(f,v)=>setForm({...form,[f.name]:f.type==='number'?Number(v):v});
  return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="glass pad">
    <div className="row"><h2>{t(mod.key)}</h2><span className="grow"/>
      <label className="input sm"><Search size={14}/><input placeholder="Filter" value={q} onChange={e=>setQ(e.target.value)}/></label>
      <button className="btn ghost" onClick={reload} aria-label="Refresh"><RefreshCw size={14}/></button>
      {!mod.readOnly&&<button className="btn" onClick={()=>setOpen(!open)}><Plus size={14}/>{t('add')}</button>}</div>
    {open&&<form onSubmit={submit} className="grid2">{mod.fields.map(f=><label key={f.name} className="fld">{f.label}
      {f.type==='select'?<select required value={form[f.name]||''} onChange={e=>set(f,e.target.value)}><option value="">—</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>
      :f.type==='textarea'?<textarea value={form[f.name]||''} onChange={e=>set(f,e.target.value)}/>
      :<input required type={f.type} value={form[f.name]??''} onChange={e=>set(f,e.target.value)}/>}</label>)}
      <button className="btn">{t('save')}</button></form>}
    {(err||error)&&<div className="alert">{err||error} <button className="link" onClick={reload}>{t('retry')}</button></div>}
    {loading?<div className="skeleton"/>:!error&&(rows.length===0?<p className="muted">{t('empty')}</p>:
    <div className="scroll"><table><thead><tr>{mod.fields.map(f=><th key={f.name}>{f.label}</th>)}<th/></tr></thead>
      <tbody>{rows.map(r=><tr key={r._id||r.id}>{mod.fields.map(f=><td key={f.name}>{String((r[f.name] && typeof r[f.name] === 'object') ? (r[f.name].name || r[f.name].title || r[f.name].code || r[f.name]._id || '') : (r[f.name] ?? ''))}</td>)}
        <td>{!mod.readOnly&&<button className="btn ghost" onClick={()=>del(r._id||r.id)} aria-label="Delete"><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div>)}
  </motion.div>;
}
