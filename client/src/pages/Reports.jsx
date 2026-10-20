import {useState} from 'react';import {Download} from 'lucide-react';import {api} from '../services/api.js';
const types=['students','faculty','attendance','grades','fees','library'];
// GET /reports/export?type=<t>&format=csv -> file blob
export default function Reports(){
  const [err,setErr]=useState('');const [busy,setBusy]=useState('');
  const dl=async ty=>{setErr('');setBusy(ty);try{const b=await api('/reports/export',{params:{type:ty,format:'csv'},blob:true});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=ty+'.csv';a.click();URL.revokeObjectURL(a.href);}catch(x){setErr(x.message);}setBusy('');};
  return <div className="glass pad"><h2>Reports & Export</h2>{err&&<div className="alert">{err}</div>}
    <div className="cards">{types.map(ty=><button key={ty} className="btn" disabled={busy===ty} onClick={()=>dl(ty)}><Download size={14}/>{ty} CSV</button>)}</div></div>;
}
