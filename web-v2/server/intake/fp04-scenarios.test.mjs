// FP-04: realistic synthetic intake boundary tests, NOT live case/booking QA.
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {handleIntake} from './handler.ts'

const origin='https://qa.example.test'
const scenarios=[
 {name:'Flight delayed',id:'a1e82c50-97c2-458a-99f9-a67d05949201',variant:'تأخیر پرواز',destination:'دبی'},
 {name:'Hotel cancelled',id:'a1e82c50-97c2-458a-99f9-a67d05949202',variant:'لغو هوتل',destination:'استانبول'},
 {name:'Driver unavailable',id:'a1e82c50-97c2-458a-99f9-a67d05949203',variant:'راننده در دسترس نیست',destination:'کابل'}
]
function request(body){
 return new Request(origin+'/api/requests',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)})
}
const payload=s=>({requestId:s.id,service:'پرواز و هتل',destination:s.destination,variant:s.variant,contact:'qa@example.invalid',consent:true,challenge:'synthetic-only',website:''})
for(const [index,s] of scenarios.entries()){
 test('FP-04 '+s.name+': accepted, repeat is idempotent, altered repeat denied and no fake receipt',async()=>{
   const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3b'+index
   const stored=new Map();let calls=0
   const deps={
     enabled:true,origin,rateLimit:async()=>true,verifyChallenge:async()=>true,
     save:async p=>{
       calls++
       const old=stored.get(p.requestId)
       if(old){
         if(JSON.stringify(old.payload)!==JSON.stringify(p))throw Error('request conflict')
         return {receipt:old.receipt,replayed:true}
       }
       stored.set(p.requestId,{payload:p,receipt});return {receipt,replayed:false}
     }
   }
   const first=await handleIntake(request(payload(s)),'test-ip',deps)
   assert.equal(first.status,201);assert.deepEqual(await first.json(),{status:'received',receipt,replayed:false})
   const repeat=await handleIntake(request({...payload(s),challenge:'synthetic-refresh'}),'test-ip',deps)
   assert.equal(repeat.status,200);assert.deepEqual(await repeat.json(),{status:'received',receipt,replayed:true})
   assert.equal(stored.size,1)
   const conflict=await handleIntake(request({...payload(s),destination:'changed-destination'}),'test-ip',deps)
   assert.equal(conflict.status,503);assert.deepEqual(await conflict.json(),{error:'temporarily_unavailable'})
   assert.equal(stored.size,1)
   const denied=await handleIntake(request({...payload(s),requestId:'a1e82c50-97c2-458a-99f9-a67d0594930'+index,consent:false}),'test-ip',deps)
   assert.equal(denied.status,400)
   assert.equal(calls,3);assert.equal(stored.size,1)
   assert.equal(JSON.stringify([...stored.values()]).includes('passport'),false)
 })
}
