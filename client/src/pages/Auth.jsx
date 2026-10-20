import {useState} from 'react';import {Navigate} from 'react-router-dom';import {motion} from 'framer-motion';
import {api} from '../services/api.js';import {useApp} from '../context/AppContext.jsx';
export default function Auth(){
  const {user,setUser,t}=useApp();const [mode,setMode]=useState('login');const [f,setF]=useState({email:'',password:'',role:'student'});const [msg,setMsg]=useState('');const [err,setErr]=useState('');
  if(user)return <Navigate to="/"/>;
  const go=async e=>{e.preventDefault();setErr('');setMsg('');
    try{if(mode==='forgot'){await api('/auth/forgot-password',{method:'POST',body:{email:f.email}});setMsg('If the account exists, a reset link has been sent.');}
    else{const r=await api(mode==='login'?'/auth/login':'/auth/register',{method:'POST',body:mode==='login'?{email:f.email,password:f.password}:f});if(mode==='login'){localStorage.setItem('accessToken',r.accessToken);setUser(r.user)}else{setMsg('Registered. You can now sign in.');setMode('login');}}}
    catch(x){setErr(x.message);}};
  const s=k=>e=>setF({...f,[k]:e.target.value});
  return <div className="authwrap"><motion.form onSubmit={go} className="glass pad auth" initial={{opacity:0,scale:.95,rotateX:8}} animate={{opacity:1,scale:1,rotateX:0}}>
    <h1>College ERP</h1><p className="muted">{mode==='login'?t('signin'):mode==='register'?'Create account':'Reset password'}</p>
    {mode==='register'&&<><label className="fld">Name<input required onChange={s('name')}/></label>
      <label className="fld">Role<select onChange={s('role')}><option value="student">Student</option><option value="faculty">Faculty</option></select></label></>}
    <label className="fld">Email<input required type="email" onChange={s('email')}/></label>
    {mode!=='forgot'&&<label className="fld">Password<input required type="password" minLength={8} onChange={s('password')}/></label>}
    {err&&<div className="alert">{err}</div>}{msg&&<div className="ok">{msg}</div>}
    <button className="btn">{mode==='login'?t('signin'):mode==='register'?'Register':'Send link'}</button>
    <div className="row">{mode!=='login'&&<button type="button" className="link" onClick={()=>setMode('login')}>Back to sign in</button>}
      {mode==='login'&&<><button type="button" className="link" onClick={()=>setMode('register')}>Register</button><span className="grow"/><button type="button" className="link" onClick={()=>setMode('forgot')}>Forgot password?</button></>}</div>
  </motion.form></div>;
}
