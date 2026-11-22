import test from 'node:test'
import assert from 'node:assert/strict'
import {readSiteDraft,parseSiteDraftState,cleanSiteDraft,saveSiteDraft} from '../src/office-v2/site-draft-bridge.ts'
const t={fa:'کابل',ps:'کابل',en:'Kabul',ar:'كابل'}
const hours={fa:'۹–۵',ps:'۹–۵',en:'9–5',ar:'٩–٥'}
const note={fa:'آزمایش',ps:'ازموينه',en:'QA',ar:'اختبار'}
const base=()=>({draftRevision:'rev-qa-1',publishedRevision:null,canEdit:true,canPublish:false,
 draft:{contact:{whatsapp:'93700123456',email:'qa@example.invalid'},
 office:{address:t,hours},design:{fontPreset:'vazirmatn-manrope'},content:{notice:note,faq:[]}}})
test('one allowlisted website editor never exposes unknown server fields or secrets',async()=>{
 const answer={...base(),draft:{...base().draft,private_secret:'not-for-browser'}}
 const read=await readSiteDraft(async(path,init)=>{
  assert.equal(path,'/api/site-settings/draft')
  assert.equal(init.method,'GET')
  assert.equal(init.credentials,'same-origin')
  assert.equal(init.headers['X-FP-Office-Request'],'same-origin')
  assert.equal(init.body,undefined)
  assert.equal(init.cache,'no-store')
  return Response.json(answer)
 })
 assert.equal(read.status,'ready')
 assert.equal(read.data.draft.contact.whatsapp,'93700123456')
 assert.doesNotMatch(JSON.stringify(read.data),/not-for-browser|private_secret/)
 assert.equal(read.data.canPublish,false)
})
test('draft parser fails closed if partial/invented data or unsafe translation shape',()=>{
 const d=base()
 for(const bad of [
  {...d,draft:{secret:'private'}},
  {...d,draft:{...d.draft,content:{notice:{en:'missing'},faq:[]}}},
  {...d,draft:{...d.draft,content:{...d.draft.content,faq:Array.from({length:6},()=>({question:t,answer:t}))}}},
  {...d,canEdit:'yes'},
  {...d,draftRevision:'../etc'},
  {...d,draft:{...d.draft,design:{fontPreset:'unreviewed'}}}
 ])assert.equal(parseSiteDraftState(bad),null)
})
test('Afghan digit conversion, email and allowlisted maps are preserved from existing Office form',()=>{
 const d=structuredClone(base().draft)
 d.contact.whatsapp='۰۷۸۱۲۳۴۵۶۷'
 d.contact.phone='٠٧٧١٢٣٤٥٦٧'
 let cleaned=cleanSiteDraft(d)
 assert.equal(cleaned.error,null)
 assert.equal(cleaned.draft.contact.whatsapp,'93781234567')
 assert.equal(cleaned.draft.contact.phone,'+93771234567')
 d.contact.mapUrl='https://example.invalid/maps'
 assert.equal(cleanSiteDraft(d).error,'invalid_map')
 delete d.contact.mapUrl
 d.contact.email='incorrect_email'
 assert.equal(cleanSiteDraft(d).error,'invalid_email')
})
test('saving a QA draft requires edit permission, CAS and a verified readback; never publishes',async()=>{
 const snapshot=base(),changed=structuredClone(snapshot.draft)
 changed.content.notice.en='Safe QA update'
 let state=base(),posts=0
 const calls=[]
 const fetcher=async(path,init)=>{
  calls.push({path,method:init.method,body:init.body?JSON.parse(init.body):null})
  assert.equal(path,'/api/site-settings/draft')
  assert.equal(init.credentials,'same-origin')
  assert.equal(init.headers['X-FP-Office-Request'],'same-origin')
  if(init.method==='POST'){
   posts++
   const body=JSON.parse(init.body)
   assert.equal(body.expected,'rev-qa-1')
   assert.deepEqual(Object.keys(body).sort(),['draft','expected'])
   assert.equal(body.draft.content.notice.en,'Safe QA update')
   state={...state,draft:body.draft,draftRevision:'rev-qa-2'}
  }
  return Response.json(state)
 }
 const outcome=await saveSiteDraft(snapshot,changed,fetcher)
 assert.equal(outcome.status,'verified')
 assert.equal(outcome.data.draftRevision,'rev-qa-2')
 assert.equal(posts,1)
 assert.deepEqual(calls.map(x=>x.method),['POST','GET'])
 assert.equal(calls.some(x=>/publish|rollback|preview/.test(x.path)),false)
})
test('no permissions, bad fields and missing authoritative readback NEVER claim save success',async()=>{
 const x=base()
 const bad={...x,canEdit:false}
 const denied=await saveSiteDraft(bad,x.draft,async()=>{throw Error('must not call')})
 assert.equal(denied.status,'access_denied')
 let count=0
 const unavailable=await saveSiteDraft(x,x.draft,async(path,init)=>{
  count++;return init.method==='POST'?Response.json({ok:true}):Response.json({error:'down'},{status:503})
 })
 assert.equal(count,2)
 assert.equal(unavailable.status,'unverified')
 let count2=0
 const conflict=await saveSiteDraft(x,x.draft,async()=>{count2++;return Response.json({error:'stale_revision'},{status:409})})
 assert.equal(conflict.status,'conflict')
 assert.equal(count2,1)
})
