import {Routes,Route,Navigate} from 'react-router-dom';import {useApp} from './context/AppContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';import Auth from './pages/Auth.jsx';import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';import Settings from './pages/Settings.jsx';import Search from './pages/Search.jsx';
import ResourcePage from './components/ResourcePage.jsx';import {modules} from './features/modules.js';
// UI-level guard only (UX). The backend MUST enforce authentication and role authorization on every endpoint.
export default function App(){
  const {user,booting}=useApp();if(booting)return <div className="authwrap"><div className="skeleton" style={{width:240}}/></div>;
  return <Routes><Route path="/login" element={<Auth/>}/>
    <Route element={user?<AppLayout/>:<Navigate to="/login"/>}><Route index element={<Dashboard/>}/>
      {modules.filter(m=>m.roles.includes(user?.role)).map(m=><Route key={m.key} path={m.key} element={<ResourcePage key={m.key} mod={m}/>}/>)}
      <Route path="reports" element={<Reports/>}/><Route path="settings" element={<Settings/>}/><Route path="search" element={<Search/>}/></Route>
    <Route path="*" element={<Navigate to="/"/>}/></Routes>;
}
