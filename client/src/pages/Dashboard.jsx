import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid} from 'recharts';
import {useApi} from '../hooks/useApi.js';import {useApp} from '../context/AppContext.jsx';
// GET /analytics/summary -> {data:{cards:[{label,value}],series:[{name,value}]}} (server scopes by role)
export default function Dashboard(){
  const {user,t}=useApp();const {data,loading,error,reload}=useApi('/analytics/summary');const d=data?.data;
  return <div><h2>{t('dashboard')} · <span className="muted">{user.role}</span></h2>
    {error&&<div className="alert">{error} <button className="link" onClick={reload}>{t('retry')}</button></div>}
    {loading?<div className="skeleton"/>:d&&<>
      <div className="cards">{d.cards.map(c=><div key={c.label} className="glass pad tilt"><div className="muted">{c.label}</div><div className="big">{c.value}</div></div>)}</div>
      <div className="glass pad" style={{height:320}}><ResponsiveContainer><BarChart data={d.series}><CartesianGrid strokeOpacity={.15}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#7c5cff" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></>}
    {!loading&&!error&&!d&&<p className="muted">{t('empty')}</p>}</div>;
}
