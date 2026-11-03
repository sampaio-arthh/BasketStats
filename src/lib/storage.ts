import type { Session } from '../types/session';
const KEY='basketstats.sessions.v1';
export function readSessions():Session[]{try{const data=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.isArray(data)?data:[]}catch{return []}}
export function writeSessions(items:Session[]){localStorage.setItem(KEY,JSON.stringify(items))}
export function downloadBackup(items:Session[]){const blob=new Blob([JSON.stringify(items,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`basketstats-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url)}
