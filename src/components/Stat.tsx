import { format } from '../lib/stats';
export function Stat({label,value,accent=false}:{label:string;value:number;accent?:boolean}){return <div className={`stat ${accent?'stat--accent':''}`}><strong>{format(value)}</strong><span>{label}</span></div>}
