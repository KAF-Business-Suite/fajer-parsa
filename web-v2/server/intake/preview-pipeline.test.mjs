// FP-INTAKE-01: full prepared Pages handler -> Turnstile -> KAF RPC contract.
// Explicitly SYNTHETIC and OFFLINE: every outbound fetch is intercepted.
// Does NOT claim a Cloudflare HTTPS deployment, real Postgres write or staff readback.
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest} from './pages-entry.ts'

const qa='https://fajr-ci-preview.fajr-parsa-qa.pages.dev'
const project='https://krzxajtrhvupyywovdzy.supabase.co'
const id='d5072836-0d50-4dfa-88dc-596e9befd276'
const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3bf'
const data={
  requestId:id,service:'ویزا و اقامت',destination:'ترکیه',variant:'خدمات سفر',
  contact:'qa@example.invalid',consent:true,challenge:'synthetic-turnstile-token',website:''
}

function config(overrides={}){
  return {
    FAJR_INTAKE_ENABLED:'true',FAJR_INTAKE_ORIGIN:qa,SUPABASE_URL:project,
    SUPABASE_SERVER_KEY:'synthetic-server-only',TURNSTILE_SECRET_KEY:'synthetic-secret',
    FAJR_RATE_LIMIT:{limit:async()=>({success:true})},...overrides
  }
}
function request(body=data,{host=qa,origin=qa,ip='192.0.2.42',type='application/json'}={}){
  return new Request(host+'/api/requests',{method:'POST',
    headers:{Origin:origin,'CF-Connecting-IP':ip,'Content-Type':type},
    body:JSON.stringify(body)})
}
async function intercept(mock,fn){
  const original=globalThis.fetch
  globalThis.fetch=mock
  try{return await fn()}finally{globalThis.fetch=original}
}
function syntheticProvider(){
  const persisted=new Map()
  const calls={challenge:0,save:0}
  let tokenOK=true,rpcFailure=false,wrongReceipt=false
  async function provider(input,options){
    const url=String(input)
    if(url==='https://challenges.cloudflare.com/turnstile/v0/siteverify'){
      calls.challenge++
      const form=new URLSearchParams(options.body)
      assert.equal(form.get('secret'),'synthetic-secret')
      assert.equal(form.get('remoteip'),'192.0.2.42')
      return Response.json({success:tokenOK,hostname:'fajr-ci-preview.fajr-parsa-qa.pages.dev',action:'fajr_intake'})
    }
    if(url===project+'/rest/v1/rpc/fajr_receive_web_request'){
      calls.save++
      assert.equal(options.headers.apikey,'synthetic-server-only')
      assert.equal(options.headers.Authorization,'Bearer synthetic-server-only')
      assert.equal(options.redirect,undefined)
      const body=JSON.parse(options.body)
      assert.deepEqual(Object.keys(body),['payload'])
      const value=body.payload
      assert.equal(value.request_id,id)
      assert.equal(value.consent,true)
      assert.deepEqual(Object.keys(value).sort(),['consent','contact','destination','request_id','service','variant'].sort())
      if(rpcFailure)return Response.json({code:'synthetic_failure'},{status:503})
      if(wrongReceipt)return Response.json([{receipt:'not-a-real-receipt',replayed:false}])
      const prior=persisted.get(value.request_id)
      if(prior){
        if(JSON.stringify(prior.value)!==JSON.stringify(value))return Response.json({code:'synthetic_conflict'},{status:409})
        return Response.json([{receipt:prior.receipt,replayed:true}])
      }
      persisted.set(value.request_id,{value,receipt})
      return Response.json([{receipt,replayed:false}])
    }
    throw Error('UNEXPECTED_EXTERNAL_REQUEST: '+new URL(url).origin)
  }
  return {provider,persisted,calls,setTokenOK:v=>tokenOK=v,setRpcFailure:v=>rpcFailure=v,setWrongReceipt:v=>wrongReceipt=v}
}

test('Complete synthetic ingress: 201 -> persisted receipt -> 200 idempotent replay, no leaked contact',async()=>{
  const p=syntheticProvider()
  await intercept(p.provider,async()=>{
    const first=await onRequest({request:request(),env:config()})
    assert.equal(first.status,201)
    assert.equal(first.headers.get('Cache-Control'),'no-store')
    assert.deepEqual(await first.json(),{status:'received',receipt,replayed:false})
    const again=await onRequest({request:request({...data,challenge:'new-synthetic-token'}),env:config()})
    assert.equal(again.status,200)
    assert.deepEqual(await again.json(),{status:'received',receipt,replayed:true})
    assert.equal(p.persisted.size,1)
    assert.equal(p.calls.save,2)
    assert.equal(p.calls.challenge,2)
    assert.equal(JSON.stringify(await p.persisted.get(id)).includes('passport'),false)
  })
})
test('Replay with changed content never overwrites the original and never forges a receipt',async()=>{
  const p=syntheticProvider()
  await intercept(p.provider,async()=>{
    assert.equal((await onRequest({request:request(),env:config()})).status,201)
    const duplicate=await onRequest({request:request({...data,destination:'دبی'}),env:config()})
    assert.equal(duplicate.status,503)
    assert.deepEqual(await duplicate.json(),{error:'temporarily_unavailable'})
    assert.equal(p.persisted.size,1)
    assert.equal(p.persisted.get(id).value.destination,'ترکیه')
  })
})
test('Invalid consent, bot field, Origin, rate limit, trusted IP and challenge all reject before writing',async()=>{
  const p=syntheticProvider()
  await intercept(p.provider,async()=>{
    assert.equal((await onRequest({request:request({...data,consent:false}),env:config()})).status,400)
    assert.equal((await onRequest({request:request({...data,website:'bot'}),env:config()})).status,400)
    assert.equal((await onRequest({request:request(data,{origin:'https://evil.example'}),env:config()})).status,403)
    assert.equal((await onRequest({request:request(data,{ip:''}),env:config()})).status,429)
    assert.equal((await onRequest({request:request(),env:config({FAJR_RATE_LIMIT:{limit:async()=>({success:false})}})})).status,429)
    p.setTokenOK(false)
    assert.equal((await onRequest({request:request(),env:config()})).status,403)
    assert.equal(p.calls.save,0)
    assert.equal(p.persisted.size,0)
  })
})
test('Provider outage and malformed receipt fail closed without echoing server secrets',async()=>{
  const p=syntheticProvider()
  await intercept(p.provider,async()=>{
    p.setRpcFailure(true)
    const unavailable=await onRequest({request:request(),env:config()})
    assert.equal(unavailable.status,503)
    assert.deepEqual(await unavailable.json(),{error:'temporarily_unavailable'})
    p.setRpcFailure(false);p.setWrongReceipt(true)
    const malformed=await onRequest({request:request(),env:config()})
    assert.equal(malformed.status,503)
    const text=await malformed.text()
    assert.doesNotMatch(text,/synthetic-server-only|synthetic-secret|qa@example.invalid/)
    assert.equal(p.persisted.size,0)
  })
})
test('Configured foreign Supabase project fails before Turnstile or any network request',async()=>{
  let outbound=0
  await intercept(async()=>{outbound++;throw Error('Not allowed')},async()=>{
    for(const wrong of [
      'https://example.supabase.co',
      'http://krzxajtrhvupyywovdzy.supabase.co',
      'https://krzxajtrhvupyywovdzy.supabase.co.evil.invalid',
      'https://krzxajtrhvupyywovdzy.supabase.co/other',
      'https://krzxajtrhvupyywovdzy.supabase.co/?x=1'
    ]){
      const r=await onRequest({request:request(),env:config({SUPABASE_URL:wrong})})
      assert.equal(r.status,503)
      assert.deepEqual(await r.json(),{error:'intake_not_enabled'})
    }
  })
  assert.equal(outbound,0)
})
