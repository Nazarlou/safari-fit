import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProposal,interpretMessage,validateTrip,MockTravelAdapter} from '../js/adapters.js';
const trip={destination:'Kenya',days:8,travelers:2,budget:6000,style:'Quiet luxury',interests:['Wildlife']};
test('conversation changes explicit preferences and retains other values',()=>{const next=interpretMessage('10 days in Tanzania, budget $7,000 per person, 3 travelers',trip);assert.equal(next.days,10);assert.equal(next.destination,'Tanzania');assert.equal(next.budget,7000);assert.equal(next.travelers,3);assert.deepEqual(next.interests,['Wildlife']);assert.equal(trip.days,8);});
test('group budgets are not silently treated as per-person budgets',()=>assert.equal(interpretMessage('budget $8000 total',trip).budget,6000));
test('itinerary covers exactly all requested days for boundary durations',()=>{for(let days=3;days<=30;days++){const p=buildProposal({...trip,days});assert.match(p.stops[0].label,/Day 1/);const final=+p.stops.at(-1).label.match(/\d+$/)[0];assert.equal(final,days);assert.equal(p.total,p.estimate*2);}});
test('budget and inter-country warnings are visible',()=>{const p=buildProposal({...trip,destination:'Both countries',days:5,budget:500});assert.equal(p.warnings.length,3);});
test('solo accommodation changes estimate',()=>assert.ok(buildProposal({...trip,travelers:1}).estimate>buildProposal(trip).estimate));
test('reject invalid input',()=>{for(const patch of [{days:0},{days:3.5},{travelers:0},{budget:NaN},{destination:'Anywhere'}])assert.throws(()=>validateTrip({...trip,...patch}));});
test('contact mock never claims delivery',async()=>{const r=await new MockTravelAdapter().submitEnquiry();assert.equal(r.delivered,false);assert.equal(r.demo,true);});

test('chat package matches respect destination and beach preference',async()=>{const {matchPackages}=await import('../js/adapters.js');const matches=matchPackages({...trip,destination:'Tanzania',days:12,budget:10000,interests:['Beach']});assert.equal(matches[0].id,'coast');assert.ok(matches.every(p=>p.country==='Tanzania'));assert.ok(matches[0].reasons.some(r=>r.includes('beach')));});
test('over-budget packages are explicitly marked as alternatives',async()=>{const {matchPackages}=await import('../js/adapters.js');const matches=matchPackages({...trip,budget:1000});assert.equal(matches[0].budgetFit,false);assert.ok(matches[0].reasons.some(r=>r.includes('above')));});
