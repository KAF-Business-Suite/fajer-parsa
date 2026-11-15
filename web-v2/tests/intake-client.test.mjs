import {test} from 'node:test'
import assert from 'node:assert/strict'
import {submitIntake,IntakeFailure,intakeErrorMessage} from '../src/lib/intake-client.ts'
const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3bf'
const data={requestId:'d5072836-0d50-4dfa-88dc-596e9befd276',service:'ویزا و اقامت',destination:'ایران',variant:'ویزای سیاحتی',contact:'qa@example.invalid',consent:true,challenge:'test-only',website:''}
test('explicit POST sends minimal payload to same-origin endpoint without credentials',async()=>{let seen;const result=await submitIntake(data,async(url,options)=>{seen={url,options};return Response.json({status:'received',receipt,replayed:false},{status:201})});assert.equal(result.receipt,receipt);assert.equal(seen.url,'/api/requests');assert.equal(seen.options.credentials,'omit');assert.equal(seen.options.redirect,'error');assert.deepEqual(JSON.parse(seen.options.body),data);assert.equal(seen.options.signal instanceof AbortSignal,true)})
test('retry retains caller request ID and accepts database replay receipt',async()=>{const ids=[];const call=async(url,options)=>{ids.push(JSON.parse(options.body).requestId);return Response.json({status:'received',receipt,replayed:true})};await submitIntake(data,call);await submitIntake({...data,challenge:'fresh-token'},call);assert.deepEqual(ids,[data.requestId,data.requestId])})
test('HTTP errors never manufacture receipts',async()=>{for(const status of [400,403,429,500,503])await assert.rejects(()=>submitIntake(data,async()=>new Response('',{status})),e=>e instanceof IntakeFailure&&e.status===status)})
test('malformed server success is rejected',async()=>{for(const body of [{status:'received',receipt:'client-generated',replayed:false},{status:'pending',receipt,replayed:false},{status:'received',receipt},{status:'received',receipt,replayed:'false'}])await assert.rejects(()=>submitIntake(data,async()=>Response.json(body)),IntakeFailure)})
test('network failure remains uncertain and does not claim receipt',async()=>{await assert.rejects(()=>submitIntake(data,async()=>{throw new TypeError('network')}));assert.match(intakeErrorMessage(new TypeError('network')),/وضعیت ثبت قطعی نیست/)})
test('customer errors never echo server error or secrets',()=>{assert.doesNotMatch(intakeErrorMessage(new Error('server-secret')),/server-secret/);assert.match(intakeErrorMessage(new IntakeFailure(429)),/کمی بعد/);assert.match(intakeErrorMessage(new IntakeFailure(403)),/تأیید امنیتی/)})

test('isolated HTTPS QA calls the existing synthetic-only Edge without exposing credentials',async()=>{
 const hadWindow=Object.prototype.hasOwnProperty.call(globalThis,'window')
 const previousWindow=globalThis.window
 try{
  globalThis.window={location:{hostname:'fp-intake-safe-review.fajr-parsa-qa.pages.dev'}}
  let attempts=0
  await assert.rejects(()=>submitIntake({...data,contact:'real@example.com'},async()=>{attempts++;throw Error('should never send')}),e=>e instanceof IntakeFailure&&e.status===400)
  assert.equal(attempts,0)
  const result=await submitIntake(data,async(url,options)=>{
   attempts++
   assert.equal(url,'https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa')
   assert.equal(options.credentials,'omit')
   assert.equal(options.redirect,'error')
   assert.equal(options.headers.Authorization,undefined)
   assert.deepEqual(JSON.parse(options.body),data)
   return Response.json({status:'received',receipt,replayed:false},{status:201})
  })
  assert.equal(result.receipt,receipt)
  assert.equal(attempts,1)
 }finally{
  if(hadWindow)globalThis.window=previousWindow
  else delete globalThis.window
 }
})
