import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {api} from '../services/api.js';import {dict} from '../utils/i18n.js';
const Ctx=createContext();export const useApp=()=>useContext(Ctx);
export function AppProvider({children}){
  const [theme,setTheme]=useState(localStorage.theme||'dark');const [lang,setLang]=useState(localStorage.lang||'en');
  const [user,setUser]=useState(null);const [booting,setBooting]=useState(true);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.theme=theme;},[theme]);
  useEffect(()=>{localStorage.lang=lang;},[lang]);
  useEffect(()=>{api('/auth/me').then(r=>setUser(r.user)).catch(()=>{}).finally(()=>setBooting(false));},[]);
  const t=useCallback(k=>dict[lang][k]||k,[lang]);
  const logout=async()=>{try{await api('/auth/logout',{method:'POST'});}catch{}setUser(null);};
  return <Ctx.Provider value={{theme,setTheme,lang,setLang,user,setUser,booting,t,logout}}>{children}</Ctx.Provider>;
}
