import { create } from 'zustand';

type User = { id:string; name:string; email:string; role:'seeker'|'employer'|'admin'; token?:string}|null

type S = { 
  user:User; 
  setUser:(u:User)=>void; 
  logout:()=>void 
}

export const useAuth = create<S>((set)=>({
  user: null,
  setUser: (u)=>set({user:u}),
  logout: ()=>{ 
    localStorage.removeItem('token'); 
    set({user:null}); 
  }
}));
