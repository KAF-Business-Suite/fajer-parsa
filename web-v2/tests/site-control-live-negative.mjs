import test from 'node:test'
import assert from 'node:assert/strict'
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const timeout=()=>AbortSignal.timeout(10000)
test('existing QA Office serves site control without login details',async()=>{
 const r=await fetch(origin+'/site-settings',{redirect:'manual',signal:timeout()})
 assert.equal(r.status,200)
 const text=await r.text()
 assert.match(text,/id="workspace"/)
 assert.match(text,/site-settings\.js/)
 assert.doesNotMatch(text,/service_role|refresh_token|access_token|sb_secret_/)
})
test('anonymous draft read is rejected by live BFF',async()=>{
 const r=await fetch(origin+'/api/site-settings/draft',{headers:{'X-FP-Office-Request':'same-origin'},redirect:'manual',signal:timeout()})
 assert.equal(r.status,401)
 assert.equal((await r.json()).error,'sign_in_required')
})
test('forged site settings POST fails before any backend state change',async()=>{
 const r=await fetch(origin+'/api/site-settings/publish',{method:'POST',
  headers:{'Content-Type':'application/json','Origin':'https://evil.invalid','X-FP-Office-Request':'same-origin'},
  body:JSON.stringify({confirmed:true,expected:'fake',expectedPublished:''}),redirect:'manual',signal:timeout()})
 assert.equal(r.status,403)
 assert.equal((await r.json()).error,'forbidden')
})
