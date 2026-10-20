import {useState} from 'react';import {api} from '../services/api.js';import {useApp} from '../context/AppContext.jsx';
// PUT /users/me {name,phone}; PUT /auth/password {currentPassword,newPassword}
export default function Settings(){
  const {user,setUser,theme,setTheme,lang,setLang}=useApp();const [p,setP]=useState({name:user.name,phone:user.phone||''});const [pw,setPw]=useState({});const [m,setM]=useState('');
  const run=fn=>async e=>{e.preventDefault();setM('');try{await fn();setM('Saved.');}catch(x){setM(x.message);}};
  return <div className="glass pad"><h2>Profile & Settings</h2>{m&&<div className="ok">{m}</div>}
    <form className="grid2" onSubmit={run(async()=>setUser((await api('/users/me',{method:'PUT',body:p})).data))}>
      <label className="fld">Name<input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label>
      <label className="fld">Phone<input value={p.phone} onChange={e=>setP({...p,phone:e.target.value})}/></label><button className="btn">Update profile</button></form>
    <form className="grid2" onSubmit={run(()=>api('/auth/password',{method:'PUT',body:pw}))}>
      <label className="fld">Current password<input type="password" required onChange={e=>setPw({...pw,currentPassword:e.target.value})}/></label>
      <label className="fld">New password<input type="password" minLength={8} required onChange={e=>setPw({...pw,newPassword:e.target.value})}/></label><button className="btn">Change password</button></form>
    <div className="row"><button className="btn ghost" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>Theme: {theme}</button>
      <button className="btn ghost" onClick={()=>setLang(lang==='en'?'ta':'en')}>Language: {lang==='en'?'English':'தமிழ்'}</button></div></div>;
}
