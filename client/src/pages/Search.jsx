import {useSearchParams} from 'react-router-dom';import {useApi} from '../hooks/useApi.js';
// GET /search?q= -> {data:[{type,id,title}]}
export default function Search(){const [sp]=useSearchParams();const q=sp.get('q')||'';const {data,loading,error}=useApi('/search',{q});
  return <div className="glass pad"><h2>Results for “{q}”</h2>{loading?<div className="skeleton"/>:error?<div className="alert">{error}</div>:(data?.data||[]).length===0?<p className="muted">No results.</p>:
  data.data.map(r=><div key={r.type+r.id} className="row"><span className="chip">{r.type}</span>{r.title}</div>)}</div>;}
