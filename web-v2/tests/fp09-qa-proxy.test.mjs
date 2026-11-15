import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest as proxy} from '../qa-only/functions/api/requests.ts'
import privateWorker from '../qa-only/worker/entry.ts'

const qa='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev'
const payload='{"requestId":"synthetic-only"}'
const request=(url=qa+'/api/requests',method='POST')=>new Request(url,{
  method,
  headers:{Origin:qa,'Content-Type':'application/json'},
  ...(method==='POST'?{body:payload}:{})
})
const bridge=(env,req=request())=>proxy({request:req,env})
const deny=async(r)=>{assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'intake_not_enabled'});assert.equal(r.headers.get('Cache-Control'),'no-store')}
test('FP-09 proxy rejects production, catalog, old/hash preview and other methods before calling Worker',async()=>{
  let calls=0
  const env={FAJR_INTAKE_ENABLED:'true',FAJR_QA_GATEWAY:{fetch:async()=>{calls++;throw Error('must not call')}}}
  for(const url of [
    'https://fajr-parsa-qa.pages.dev/api/requests',
    'https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev/api/requests',
    'https://hash.fajr-parsa-qa.pages.dev/api/requests',
    qa+'/api/other'
  ]) await deny(await bridge(env,request(url)))
  await deny(await bridge(env,request(qa+'/api/requests','GET')))
  assert.equal(calls,0)
})
test('FP-09 no binding, disabled flag or throwing gateway fail closed',async()=>{
  await deny(await bridge({}))
  await deny(await bridge({FAJR_INTAKE_ENABLED:'true'}))
  await deny(await bridge({FAJR_INTAKE_ENABLED:'false',FAJR_QA_GATEWAY:{fetch:()=>Promise.resolve(new Response('oops'))}}))
  await deny(await bridge({FAJR_INTAKE_ENABLED:'true',FAJR_QA_GATEWAY:{fetch:()=>Promise.reject(new Error('synthetic backend failed'))}}))
})
test('FP-09 authorized QA route forwards unchanged Request only to private Worker binding',async()=>{
  let forwarded
  const req=request()
  const gateway={fetch:async r=>{forwarded=r;return Response.json({status:'received',receipt:'31122fb7-582a-4b5a-8db9-4f371ceac3bf',replayed:false},{status:201})}}
  const res=await bridge({FAJR_INTAKE_ENABLED:'true',FAJR_QA_GATEWAY:gateway},req)
  assert.strictEqual(forwarded,req)
  assert.equal(res.status,201)
  assert.equal((await res.json()).status,'received')
})
test('FP-09 private Worker itself remains deny-by-default',async()=>{
  const res=await privateWorker.fetch(request(),{})
  await deny(res)
})
