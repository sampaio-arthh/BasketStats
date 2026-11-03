export type SessionType = 'training' | 'game';
export interface Session { id:string; type:SessionType; title:string; date:string; points:number; assists:number; rebounds:number; steals:number; fgMade:number; fgAttempted:number; threeMade:number; threeAttempted:number; ftMade:number; ftAttempted:number; notes:string; }
export type SessionDraft = Omit<Session,'id'>;
