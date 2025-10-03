import { create } from 'zustand';

type User = { id:string; name:string; role:'seeker'|'employer'|'mentor'|'admin'}|null

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
