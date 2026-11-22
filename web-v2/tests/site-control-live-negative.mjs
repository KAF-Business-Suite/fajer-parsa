import test from 'node:test'
import assert from 'node:assert/strict'
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const timeout=()=>AbortSignal.timeout(10000)
test('old site settings entry stays safe during staged QA console migration',async()=>{
 const r=await fetch(origin+'/site-settings',{redirect:'manual',signal:timeout()})
 assert.ok([200,302].includes(r.status),'legacy page or protected redirect')
 if(r.status===302){
  assert.ok(['/?next=console-website','/console?next=console-website'].includes(r.headers.get('Location')),'safe old/new QA guest destinations only')
  assert.match(r.headers.get('Cache-Control'),/no-store/)
  return
 }
 const page=await r.text()
 assert.match(page,/id="workspace"/)
 assert.match(page,/site-settings\.js/)
 assert.doesNotMatch(page,/service_role|refresh_token|access_token|sb_secret_/)
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
