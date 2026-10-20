import {NavLink,Outlet,useNavigate} from 'react-router-dom';import {LayoutDashboard,BookOpen,Settings,LogOut,Sun,Moon,Languages,Download} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx';import {modules} from '../features/modules.js';
export default function AppLayout(){
  const {user,t,logout,theme,setTheme,lang,setLang}=useApp();const nav=useNavigate();
  const items=modules.filter(m=>m.roles.includes(user.role));
  return <div className="shell"><aside className="glass side"><div className="logo">🎓 College ERP</div>
    <NavLink to="/" end><LayoutDashboard size={16}/>{t('dashboard')}</NavLink>
    {items.map(m=><NavLink key={m.key} to={'/'+m.key}><BookOpen size={16}/>{t(m.key)}</NavLink>)}
    <NavLink to="/reports"><Download size={16}/>{t('reports')}</NavLink><NavLink to="/settings"><Settings size={16}/>{t('settings')}</NavLink></aside>
    <div className="main"><header className="glass top"><form className="grow" onSubmit={e=>{e.preventDefault();nav('/search?q='+encodeURIComponent(e.target.q.value));}}><input name="q" className="gs" placeholder={t('search')}/></form>
      <button className="btn ghost" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Theme">{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button>
      <button className="btn ghost" onClick={()=>setLang(lang==='en'?'ta':'en')} aria-label="Language"><Languages size={16}/>{lang==='en'?'தமிழ்':'EN'}</button>
      <button className="btn ghost" onClick={logout}><LogOut size={16}/>{t('signout')}</button></header><main><Outlet/></main></div></div>;
}
