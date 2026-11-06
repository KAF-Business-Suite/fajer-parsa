import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest} from './pages-entry.ts'
const qa='https://test-branch.fajr-parsa-qa.pages.dev'
const config={FAJR_OFFICE_ENABLED:'true',FAJR_OFFICE_ORIGIN:qa,SUPABASE_URL:'https://krzxajtrhvupyywovdzy.supabase.co',SUPABASE_SERVER_KEY:'synthetic-only'}
test('office API stays closed on production and on missing or mismatched settings',async()=>{
 for(const [host,env] of [['https://fajr-parsa-qa.pages.dev',config],[qa,{}],[qa,{...config,FAJR_OFFICE_ORIGIN:'https://other.fajr-parsa-qa.pages.dev'}]]){
  const r=await onRequest({request:new Request(host+'/api/office'),env})
  assert.equal(r.status,503)
  assert.equal(r.headers.get('Cache-Control'),'no-store')
 }
})
test('QA gateway refuses missing session without hitting Supabase',async()=>{
 const r=await onRequest({request:new Request(qa+'/api/office'),env:config})
 assert.equal(r.status,401)
})
test('unexpected host or HTTP has no path to an enabled API',async()=>{
 const r=await onRequest({request:new Request('https://evil.invalid/api/office',{method:'POST'}),env:{...config,FAJR_OFFICE_ORIGIN:'https://evil.invalid'}})
 assert.equal(r.status,503)
})
