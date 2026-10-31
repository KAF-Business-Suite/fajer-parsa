import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const base='https://fajr-office-qa.khoojafahim.workers.dev/'
const config='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config'
const browser=await chromium.launch({headless:true})
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:840},locale:'fa-AF',reducedMotion:'reduce'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000})
  await page.locator('#login-form').waitFor()
  assert.equal(await page.locator('h1').textContent(),'دفتر مدیریت درخواست‌ها')
  assert.equal(await page.locator('#office-view').isVisible(),false)
  const cfg=await page.evaluate(async url=>{
   const response=await fetch(url,{cache:'no-store'})
   const json=await response.json()
   return {status:response.status,keyValid:typeof json.publishableKey==='string'&&json.publishableKey.length>20}
  },config)
  assert.deepEqual(cfg,{status:200,keyValid:true},'CORS/browser config unavailable')

  // Test the ACTUAL remote office API, not a mocked Cloudflare forwarding route.
  const apiResult=await page.evaluate(async()=>{
   const response=await fetch('https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/api/office?offset=0',{
    method:'GET',headers:{Authorization:'Bearer synthetic.invalid.token'},cache:'no-store'
   })
   return {status:response.status,body:await response.json()}
  })
  assert.equal(apiResult.status,401,'real browser CORS/office permission must reject invalid bearer token')
  assert.equal(apiResult.body.error,'sign_in_required')

  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow')
  await page.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'synthetic_invalid_credentials'})}))
  await page.locator('#email').fill('qa@example.invalid')
  await page.locator('#password').fill('synthetic-do-not-send')
  await page.locator('#login-button').click()
  await page.getByRole('alert').first().waitFor()
  assert.match(await page.locator('#login-alert').textContent(),/ایمیل یا رمز صحیح نیست/)
  assert.equal(await page.locator('#office-view').isVisible(),false)
  assert.deepEqual(errors,[])
  await context.close()
 }

 // Authenticated UI contract with fully intercepted synthetic session and cases.
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'fa-AF'})
 const page=await context.newPage()
 const one='00000000-0000-4000-8000-000000000011'
 let state='received',writes=0,reads=0
 await page.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'synthetic-access-token',refresh_token:'synthetic-refresh-token',token_type:'bearer',expires_in:3600})}))
 await page.route('**/functions/v1/fajr-office/api/office**',async route=>{
  const req=route.request()
  if(req.method()==='POST'){
   const data=req.postDataJSON()
   assert.deepEqual(data,{id:one,expected:'received',status:'reviewing'})
   assert.equal(req.headers().authorization,'Bearer synthetic-access-token')
   writes++;state='reviewing'
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:one,status:state})})
  }
  reads++
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:one,service:'synthetic visa',destination:'synthetic',variant:'',contact:'qa@example.invalid',status:state,created_at:'2026-10-31T00:00:00Z'}])})
 })
 await page.goto(base,{waitUntil:'domcontentloaded'})
 await page.locator('#email').fill('qa@example.invalid')
 await page.locator('#password').fill('synthetic-only')
 await page.locator('#login-button').click()
 await page.locator('#office-view').waitFor({state:'visible'})
 assert.equal(await page.locator('.case').count(),1)
 await page.locator('.case select').selectOption('reviewing')
 assert.equal(await page.locator('#confirm').evaluate(el=>el.open),true)
 await page.locator('#confirm-yes').click()
 await page.waitForFunction(()=>document.querySelector('.case .status')?.textContent==='در حال بررسی')
 assert.equal(writes,1)
 assert.ok(reads>=2)
 await page.locator('#logout').click()
 await page.locator('#login-view').waitFor({state:'visible'})
 assert.equal(await page.locator('#office-view').isVisible(),false)
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('fajr-office-qa-session-v1')),null)
 await context.close()
 // Authorized login but denied office membership must show a visible error.
 const deniedContext=await browser.newContext({viewport:{width:390,height:844}})
 const denied=await deniedContext.newPage()
 await denied.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'synthetic-access-token',refresh_token:'synthetic-refresh-token'})}))
 await denied.route('**/functions/v1/fajr-office/api/office**',route=>route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'forbidden'})}))
 await denied.goto(base,{waitUntil:'domcontentloaded'})
 await denied.locator('#email').fill('qa@example.invalid')
 await denied.locator('#password').fill('synthetic-only')
 await denied.locator('#login-button').click()
 await denied.waitForFunction(()=>{const el=document.querySelector('#login-alert');return !!el&&el.textContent?.includes('دسترسی')})
 assert.equal(await denied.locator('#login-view').isVisible(),true)
 assert.equal(await denied.locator('#office-view').isVisible(),false)
 await deniedContext.close()

 // Self-service recovery: no genuine account email or password reset is sent.
 const recoveryContext=await browser.newContext({viewport:{width:390,height:844}})
 const recoveryPage=await recoveryContext.newPage()
 let emailRequests=0,changed=0
 await recoveryPage.route('**/auth/v1/recover?**',async route=>{
  const request=route.request(),payload=request.postDataJSON()
  assert.deepEqual(payload,{email:'qa@example.invalid'})
  assert.equal(new URL(request.url()).searchParams.get('redirect_to'),base)
  emailRequests++
  await route.fulfill({status:200,contentType:'application/json',body:'{}'})
 })
 await recoveryPage.goto(base,{waitUntil:'domcontentloaded'})
 await recoveryPage.locator('#forgot-button').click()
 await recoveryPage.locator('#recovery-email').fill('qa@example.invalid')
 await recoveryPage.locator('#send-recovery').click()
 await recoveryPage.waitForFunction(()=>document.querySelector('#recovery-message')?.textContent?.includes('لینک بازیابی'))
 assert.equal(emailRequests,1)
 assert.equal(await recoveryPage.locator('#recovery-request').isVisible(),true)
 await recoveryPage.goto(base+'#access_token=synthetic-recovery-token&type=recovery')
 await recoveryPage.locator('#password-reset-view').waitFor({state:'visible'})
 assert.equal(await recoveryPage.evaluate(()=>location.hash),'','recovery token must be removed from address bar')
 await recoveryPage.route('**/auth/v1/user',async route=>{
  const req=route.request()
  assert.equal(req.method(),'PUT')
  assert.equal(req.headers().authorization,'Bearer synthetic-recovery-token')
  assert.equal(req.postDataJSON().password,'synthetic-valid-pass-2026!')
  changed++
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'synthetic-user'})})
 })
 await recoveryPage.locator('#new-password').fill('synthetic-valid-pass-2026!')
 await recoveryPage.locator('#confirm-password').fill('synthetic-valid-pass-2026!')
 await recoveryPage.locator('#save-password').click()
 await recoveryPage.waitForFunction(()=>document.querySelector('#login-alert')?.textContent?.includes('رمز تازه ثبت شد'))
 assert.equal(changed,1)
 assert.equal(await recoveryPage.locator('#password-reset-view').isVisible(),false)
 assert.equal(await recoveryPage.locator('#login-view').isVisible(),true)
 await recoveryContext.close()
 console.log('PASS: recovery email request and password update with intercepted synthetic tokens, no actual email sent')

 console.log('PASS: synthetic full office login -> list -> confirm -> audited API request -> refresh -> logout, and visible access denial')

 console.log('PASS: public office loads at 390/1280, browser CORS config works, invalid login intercepted, private workspace stays closed')
}finally{await browser.close()}
