import {useEffect,useState,useCallback} from 'react';import {api} from '../services/api.js';
export function useApi(path,params){
  const [s,set]=useState({data:null,loading:true,error:null});const key=JSON.stringify(params||{});
  const load=useCallback(()=>{set(x=>({...x,loading:true,error:null}));api(path,{params}).then(r=>set({data:r,loading:false,error:null})).catch(e=>set({data:null,loading:false,error:e.message}));},[path,key]);
  useEffect(load,[load]);return {...s,reload:load};
}
