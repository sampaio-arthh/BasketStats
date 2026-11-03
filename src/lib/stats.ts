import type { Session } from '../types/session';
export const percentage=(made:number,attempted:number)=>attempted>0?(made/attempted)*100:0;
export const trueShooting=(points:number,fga:number,fta:number)=>{const denominator=2*(fga+0.44*fta);return denominator>0?(points/denominator)*100:0};
export const format=(value:number)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(value);
export function aggregate(items:Session[]){const n=items.length||1;const sum=(key:keyof Session)=>items.reduce((total,item)=>total+(typeof item[key]==='number'?Number(item[key]):0),0);const points=sum('points'),fga=sum('fgAttempted'),fta=sum('ftAttempted');return {count:items.length,ppg:points/n,apg:sum('assists')/n,rpg:sum('rebounds')/n,spg:sum('steals')/n,fg:percentage(sum('fgMade'),fga),three:percentage(sum('threeMade'),sum('threeAttempted')),ft:percentage(sum('ftMade'),fta),ts:trueShooting(points,fga,fta)};}
