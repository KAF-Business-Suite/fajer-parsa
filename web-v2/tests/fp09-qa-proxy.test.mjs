import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest as proxy} from '../qa-only/functions/api/requests.ts'
import privateWorker from '../qa-only/worker/entry.ts'
const qa='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev'
const data={requestId:'d5072836-0d50-4dfa-88dc-596e9befd276',service:'ویزا و اقامت',destination:'امارات',variant:'بررسی',contact:'fp09@example.invalid',consent:true,challenge:'synthetic-token',website:''}
const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3bf'
const req=(url=qa+'/api/requests',body=JSON.stringify(data),origin=qa,method='POST')=>new Request(url,{method,headers:{Origin:origin,'Content-Type':'application/json'},...(method==='POST'?{body}:{})})
const off=async r=>{assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'intake_not_enabled'});assert.equal(r.headers.get('Cache-Control'),'no-store')}
test('FP-09 rejects other hosts, methods, routes and Origins before any network call',async()=>{
  let calls=0;const fetcher=async()=>{calls++;throw Error('should not run')}
  for(const url of ['https://fajr-parsa-qa.pages.dev/api/requests','https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev/api/requests','https://hash.fajr-parsa-qa.pages.dev/api/requests',qa+'/api/other']){
    await off(await proxy({request:req(url),fetcher}))
  }
  await off(await proxy({request:req(qa+'/api/requests',JSON.stringify(data),'https://bad.example'),fetcher}))
  await off(await proxy({request:req(qa+'/api/requests',undefined,qa,'GET'),fetcher}))
  assert.equal(calls,0)
})
test('FP-09 refuses real customer contact and >4 KiB bodies',async()=>{
  let calls=0;const fetcher=async()=>{calls++;throw Error('should not run')}
  const r=await proxy({request:req(qa+'/api/requests',JSON.stringify({...data,contact:'customer@example.com'})),fetcher})
  assert.equal(r.status,400);assert.equal((await r.json()).error,'qa_synthetic_contact_required')
  await off(await proxy({request:req(qa+'/api/requests',JSON.stringify({...data,variant:'x'.repeat(5000)})),fetcher}))
  assert.equal(calls,0)
})
test('FP-09 sends synthetic payload to existing Edge without any Cloudflare Supabase secret',async()=>{
  let calls=0
  const fetcher=async(url,options)=>{
    calls++;assert.equal(url,'https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa')
    assert.equal(options.method,'POST');assert.equal(options.headers.Origin,qa)
    assert.equal(options.headers.Authorization,undefined)
    assert.deepEqual(JSON.parse(options.body),data)
    return Response.json({status:'received',receipt,replayed:false},{status:201})
  }
  const r=await proxy({request:req(),fetcher})
  assert.equal(r.status,201);assert.deepEqual(await r.json(),{status:'received',receipt,replayed:false});assert.equal(calls,1)
})
test('FP-09 propagates safe Edge denial; invalid receipt or outage stays closed',async()=>{
  let r=await proxy({request:req(),fetcher:async()=>Response.json({error:'challenge_failed'},{status:403})})
  assert.equal(r.status,403);assert.equal((await r.json()).error,'challenge_failed')
  await off(await proxy({request:req(),fetcher:async()=>Response.json({status:'received',receipt:'bad',replayed:false},{status:201})}))
  await off(await proxy({request:req(),fetcher:async()=>{throw Error('network unavailable')}}))
})
test('old private Worker remains fail-closed without any bindings',async()=>{
  await off(await privateWorker.fetch(req(),{}))
})
