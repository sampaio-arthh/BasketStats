import type { SessionDraft } from '../../types/session';
export const emptySession=(type:'training'|'game'):SessionDraft=>({type,title:'',date:new Date().toISOString().slice(0,10),points:0,assists:0,rebounds:0,steals:0,fgMade:0,fgAttempted:0,threeMade:0,threeAttempted:0,ftMade:0,ftAttempted:0,notes:''});
