import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest} from './pages-entry.ts'

// FP-INTAKE-01: the prepared entrypoint stays outside functions/.
// These are synthetic HTTP contract tests; no real database, Turnstile, or customer send.
const qa='https://fajr-ci-preview.fajr-parsa-qa.pages.dev'
const live='https://fajr-parsa-qa.pages.dev'
const testEnv=()=>({
  FAJR_INTAKE_ENABLED:'true',
  FAJR_INTAKE_ORIGIN:qa,
  SUPABASE_URL:'https://example.supabase.co',
  SUPABASE_SERVER_KEY:'synthetic-server-secret-never-log',
  TURNSTILE_SECRET_KEY:'synthetic-turnstile-secret-never-log',
  FAJR_RATE_LIMIT:{limit:async()=>{throw Error('limiter must never be called')}}
})
const make=(url,method='GET',headers={})=>new Request(url+'/api/requests',{method,headers})
const checkClosed=async(request,env)=>{
  const r=await onRequest({request,env})
  assert.equal(r.status,503)
  assert.equal(r.headers.get('Cache-Control'),'no-store')
  assert.deepEqual(await r.json(),{error:'intake_not_enabled'})
}
test('Production remains 503 with all fake bindings and active flag',async()=>{
  const env={...testEnv(),FAJR_INTAKE_ORIGIN:live}
  await checkClosed(make(live),env)
  await checkClosed(make(live),testEnv())
})
test('Unapproved websites and malformed origins never enable preview',async()=>{
  for(const origin of [
    'https://fajr-parsa-qa.pages.dev.evil.example',
    'https://malicious.example',
    'http://fajr-ci-preview.fajr-parsa-qa.pages.dev',
    'https://fajr-ci-preview.fajr-parsa-qa.pages.dev:8443'
  ])await checkClosed(make(origin),{...testEnv(),FAJR_INTAKE_ORIGIN:origin})
})
test('Preview requires exact server-binding origin and all dependencies',async()=>{
  const base=testEnv()
  const variants=[
    {...base,FAJR_INTAKE_ORIGIN:undefined},
    {...base,FAJR_INTAKE_ORIGIN:'https://different.fajr-parsa-qa.pages.dev'},
    {...base,FAJR_INTAKE_ENABLED:'false'},
    {...base,FAJR_RATE_LIMIT:undefined},
    {...base,SUPABASE_URL:undefined},
    {...base,SUPABASE_SERVER_KEY:undefined},
    {...base,TURNSTILE_SECRET_KEY:undefined}
  ]
  for(const env of variants)await checkClosed(make(qa),env)
})
test('Fully configured preview reaches the existing HTTP handler, not the datastore',async()=>{
  const env=testEnv()
  const response=await onRequest({request:make(qa),env})
  assert.equal(response.status,405)
  assert.deepEqual(await response.json(),{error:'method_not_allowed'})
  const missingOrigin=await onRequest({request:make(qa,'POST'),env})
  assert.equal(missingOrigin.status,403)
  assert.deepEqual(await missingOrigin.json(),{error:'origin_denied'})
  const wrongType=await onRequest({request:make(qa,'POST',{Origin:qa}),env})
  assert.equal(wrongType.status,415)
  assert.deepEqual(await wrongType.json(),{error:'json_required'})
})
