import {normalizeConciergeResponse} from './response-contract.js';
import {packages} from './data.js';
import {config} from './config.js';
const delay = () => new Promise(resolve => setTimeout(resolve,550));
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
export function validateTrip(t){
 if(!['Kenya','Tanzania','Both countries'].includes(t.destination)) throw new Error('Choose a destination.');
 if(!Number.isInteger(t.days)||t.days<3||t.days>30) throw new Error('Choose between 3 and 30 days.');
 if(!Number.isInteger(t.travelers)||t.travelers<1||t.travelers>12) throw new Error('Choose between 1 and 12 travelers.');
 if(!Number.isFinite(t.budget)||t.budget<500||t.budget>100000) throw new Error('Enter a budget from $500 to $100,000 per person.');
 return t;
}
export function interpretMessage(message,current){
 const next={...current,interests:[...current.interests]};const s=message.toLowerCase();
 const days=s.match(/\b(\d{1,2})\s*days?\b/);if(days) next.days=clamp(+days[1],3,30);
 const travelers=s.match(/\b(\d{1,2})\s*(?:travelers?|travellers?|people|guests)\b/);if(travelers) next.travelers=clamp(+travelers[1],1,12);
 if(/\b(solo|alone)\b/.test(s))next.travelers=1;
 if(/\b(couple|two of us|honeymoon)\b/.test(s))next.travelers=2;
 if(s.includes('both countries')||(s.includes('kenya')&&s.includes('tanzania')))next.destination='Both countries';else if(s.includes('tanzania'))next.destination='Tanzania';else if(s.includes('kenya'))next.destination='Kenya';
 const budget=s.match(/(?:\$|usd\s*|budget(?:\s+of|\s+around)?\s*)([\d,]+(?:\.\d+)?)(k)?/i);
 if(budget&&!/\b(total|for both|for all)\b/.test(s))next.budget=clamp(Number(budget[1].replaceAll(',',''))*(budget[2]?1000:1),500,100000);
 if(s.includes('honeymoon'))next.style='Honeymoon';else if(s.includes('family'))next.style='Family adventure';else if(s.includes('photograph'))next.style='Photography focused';
 for(const [word,interest] of [['beach','Beach'],['sea','Beach'],['photograph','Photography'],['culture','Culture'],['wildlife','Wildlife']])if(s.includes(word)&&!next.interests.includes(interest))next.interests.push(interest);
 return next;
}
export function buildProposal(trip){
 validateTrip(trip);
 const beach=trip.interests.includes('Beach')&&trip.destination!=='Kenya';
 const names=trip.destination==='Both countries'?['Nairobi & the Maasai Mara','Serengeti plains','Arusha & departure']:trip.destination==='Kenya'?['Nairobi & arrival','Amboseli landscapes','Maasai Mara']:beach?['Arusha & arrival','Serengeti plains','Zanzibar coast']:['Arusha & arrival','Ngorongoro highlands','Serengeti plains'];
 const first=trip.days>=7?2:1;const last=Math.max(1,Math.floor((trip.days-first)/2));const middle=trip.days-first-last;
 let day=1;const lengths=[first,middle,last];const stops=names.map((place,i)=>{const start=day;day+=lengths[i];return {label:`Day ${start}${lengths[i]>1?'–'+(day-1):''}`,place,detail:i===0?'Arrive, settle in, and ease into your journey.':i===2&&beach?'Slow mornings and time beside the ocean.':`${trip.style} with ${trip.interests.length?trip.interests.join(', ').toLowerCase():'wildlife'} in mind.`};});
 const rate=trip.style==='Honeymoon'?850:trip.style==='Family adventure'?620:750;
 const estimate=Math.round((trip.days*rate+(trip.destination==='Both countries'?900:0)+(beach?450:0)+(trip.travelers===1?trip.days*180:0))/100)*100;
 const warnings=[];if(estimate>trip.budget)warnings.push('This illustrative luxury route exceeds your budget. Consider fewer days or a different accommodation level.');if(trip.days<6)warnings.push('This is a fast-paced outline. For a real short stay, a specialist should simplify it to one safari area.');if(trip.destination==='Both countries'&&trip.days<10)warnings.push('Two countries need more travel time. Consider at least 10 days or focus on one country.');
 return {id:'demo-'+Date.now(),title:trip.destination==='Both countries'?'Your East African journey':`Your private ${trip.destination} journey`,trip:{...trip},stops,estimate,total:estimate*trip.travelers,warnings,demo:true};
}
export class MockTravelAdapter{
 async listPackages(){return packages;}
 async createProposal(trip){await delay();return buildProposal(trip);}
 async sendMessage({message,trip,history}){
  await delay();const next=interpretMessage(message,trip);const s=message.toLowerCase();
  let reply=`I’m working with ${next.days} days in ${next.destination}, ${next.travelers} traveler${next.travelers>1?'s':''}, and $${next.budget.toLocaleString('en-US')} per person. ${next.style} sounds like a lovely starting point.`;
  if(/\b(total|for both|for all)\b/.test(s))reply+=' Your budget sounds like a group total. Please enter the per-person amount in the planning form; I have kept the current budget unchanged.';
  if(/\b(book|pay|available|availability)\b/.test(s))reply+=' This preview cannot check availability or take bookings. A specialist would need to confirm a real quote.';
  else if(/\b(visa|vaccine|malaria|health)\b/.test(s))reply+=' Please check official entry guidance and consult a travel clinician for personal health preparations.';
  else if(/\b(beach|sea)\b/.test(s))reply+=next.destination==='Kenya'?' A Kenyan coast extension could be discussed with a specialist; the current Kenya outline stays inland.':' I have noted a beach finale. Choose Tanzania to explore the Serengeti and Zanzibar outline.';
  else if(s.includes('photograph'))reply+=' I have noted photography: slower game drives and time to wait for the light would shape your brief.';
  else reply+=' You can refine any field, then create your sample journey below.';
  reply+='\n\nThese are simulated suggestions. Travel dates, camp preferences, and availability would be confirmed in a real consultation.';
  return {reply,trip:next,matches:matchPackages(next)};
 }
 async submitEnquiry(){await delay();return {demo:true,delivered:false,message:'Preview complete. Your enquiry has not been sent or stored. Download your trip brief from the journey planner to keep your ideas.'};}
}
export class ApiTravelAdapter{
 constructor(base){this.sessionId=crypto.randomUUID();if(!/^https:\/\//.test(base))throw new Error('Production API requires an HTTPS base URL.');this.base=base.replace(/\/$/,'');}
 async request(path,body){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);try{const response=await fetch(this.base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},credentials:'omit',body:body?JSON.stringify(body):undefined,signal:controller.signal});if(!response.ok)throw new Error('The concierge is unavailable. Please try again.');return await response.json();}finally{clearTimeout(timer);}}
 listPackages(){return this.request('/v1/packages');}
 createProposal(trip){validateTrip(trip);return this.request('/v1/proposals',{trip});}
 sendMessage(payload){return this.request('/v1/concierge/messages',{...payload,sessionId:this.sessionId});}
 resetSession(){this.sessionId=crypto.randomUUID();}
 submitEnquiry(payload){return this.request('/v1/enquiries',payload);}
}
// n8n mode connects only conversation discovery. Other surfaces remain labeled demos.
export class N8nChatAdapter extends MockTravelAdapter{
 constructor(webhookUrl){super();this.webhookUrl=webhookUrl;this.sessionId=crypto.randomUUID();this.generation=0;}
 async sendMessage({message,trip}){
  validateTrip(trip);
  if(typeof message!=='string'||!message.trim()||message.length>1500)throw new Error('Please enter a message of up to 1,500 characters.');
  if(!/^https:\/\//.test(this.webhookUrl))throw new Error('The concierge connection is not configured.');
  const generation=this.generation,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   const response=await fetch(this.webhookUrl,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:message.trim(),trip,sessionId:this.sessionId}),signal:controller.signal});
   if(!response.ok)throw new Error(response.status===404?'The concierge is not online yet. Please try again later.':response.status===429?'Too many messages. Please wait a minute.':'The concierge could not complete the search. Please try again.');
   let value;try{value=await response.json();}catch{throw new Error('The concierge returned an invalid response. Please try again.');}
   const result=normalizeConciergeResponse(value);
   if(generation!==this.generation)throw new Error('Conversation reset. Please send your message again.');
   return result;
  }catch(error){if(error.name==='AbortError')throw new Error('The search took too long. Please try again.');if(error instanceof TypeError)throw new Error('Unable to connect to the concierge. Please check your connection and try again.');throw error;}finally{clearTimeout(timer);}
 }
 resetSession(){this.sessionId=crypto.randomUUID();this.generation++;}
}
export const travel=config.mode==='mock'?new MockTravelAdapter():config.mode==='n8n'?new N8nChatAdapter(config.webhookUrl):new ApiTravelAdapter(config.apiBase);
export function matchPackages(trip){
 validateTrip(trip);
 return packages.filter(p=>trip.destination==='Both countries'||p.country===trip.destination).map(p=>{
  const budgetFit=p.price<=trip.budget;
  const durationGap=Math.abs(p.days-trip.days);
  const beachFit=trip.interests.includes('Beach')&&p.id==='coast';
  const score=(budgetFit?40:Math.max(0,30-(p.price-trip.budget)/200))+Math.max(0,30-durationGap*5)+(beachFit?35:0);
  const reasons=[`${p.country} destination`,durationGap===0?'Matches your trip length':`${p.days}-day starting point; adapt to ${trip.days} days`,budgetFit?'Sample starting price within your per-person budget':`Sample starting price is $${(p.price-trip.budget).toLocaleString('en-US')} above your per-person budget`];
  if(beachFit)reasons.push('Includes the beach time you asked for');
  if(trip.interests.includes('Photography'))reasons.push('Wildlife route to explore at a photography-focused pace');
  return {...p,score,reasons,budgetFit};
 }).sort((a,b)=>b.score-a.score).slice(0,2);
}

