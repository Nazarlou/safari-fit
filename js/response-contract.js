// Public response boundary shared with the n8n template. Never return raw tool output.
export function normalizeConciergeResponse(value){
 const text=(v,max=5000)=>typeof v==='string'?v.slice(0,max):'';
 const list=v=>Array.isArray(v)?v.slice(0,20).map(x=>text(x,1000)).filter(Boolean):[];
 if(!value||typeof value.reply!=='string'||!value.reply.trim())throw new Error('The concierge returned an incomplete response. Please try again.');
 const t=value.trip;
 if(!t||!['Kenya','Tanzania','Both countries'].includes(t.destination)||!Number.isInteger(t.days)||t.days<3||t.days>30||!Number.isInteger(t.travelers)||t.travelers<1||t.travelers>12||!Number.isFinite(t.budget)||t.budget<500||t.budget>100000||!['Quiet luxury','Honeymoon','Family adventure','Photography focused'].includes(t.style)||!Array.isArray(t.interests))throw new Error('The concierge returned invalid travel preferences. Please try again.');
 if(!Array.isArray(value.matches))throw new Error('The concierge returned no package list. Please try again.');
 const matches=value.matches.slice(0,4).map((p,i)=>{
  if(!p||!text(p.title)||!['Kenya','Tanzania','Both countries'].includes(p.country))throw new Error('An incomplete package was returned. Please try again.');
  return {id:`option-${i+1}`,source:'mcp',title:text(p.title,150),country:p.country,days:Number.isInteger(p.days)&&p.days>0?p.days:null,priceLabel:text(p.priceLabel,200)||'Price on request',route:text(p.route,500),description:text(p.description,2000),stops:list(p.stops),inclusions:list(p.inclusions),exclusions:list(p.exclusions),notes:list(p.notes),reasons:list(p.reasons),image:p.country==='Kenya'?'assets/elephants.webp':'assets/lion.webp',alt:'Concept safari imagery; not a photograph of the offered package'};
 });
 return {reply:text(value.reply),trip:{destination:t.destination,days:t.days,travelers:t.travelers,budget:t.budget,style:t.style,interests:t.interests.filter(x=>['Wildlife','Photography','Culture','Beach'].includes(x))},matches};
}
