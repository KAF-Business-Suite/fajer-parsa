import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import officeCandidate from '../../workers/fajr-office-qa/worker.mjs'
const base='https://fajr-office-qa.khoojafahim.workers.dev/'
const config='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config'
// Local candidate UI is exercised without hitting the rolled-back staff Worker or real staff APIs.
async function installCandidate(context){
 const target='https://fajr-office-qa.khoojafahim.workers.dev/'
 await context.route('https://krzxajtrhvupyywovdzy.supabase.co/**',route=>route.abort('blockedbyclient'))
 await context.route(config,route=>route.fulfill({
  status:200,contentType:'application/json',
  headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},
  body:JSON.stringify({publishableKey:'sb_publishable_synthetic_ci_key_only'})
 }))
 await context.route(target+'**',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(req.method()!=='GET'||!['/','/app.css','/app.js'].includes(url.pathname))return route.abort('blockedbyclient')
  const response=await officeCandidate.fetch(new Request(req.url(),{method:'GET'}),{})
  return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers.entries()),body:await response.text()})
 })
}
const browser=await chromium.launch({headless:true})
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:840},locale:'fa-AF',reducedMotion:'reduce'})
  await installCandidate(context)
  const page=await context.newPage(),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000})
  await page.locator('#login-form').waitFor()
  assert.equal(await page.locator('h1').textContent(),'دفتر مدیریت درخواست‌ها')
  assert.equal(await page.locator('#office-view').isVisible(),false)
  const cfg=await page.evaluate(async url=>{const r=await fetch(url,{cache:'no-store'});const x=await r.json();return {status:r.status,keyValid:typeof x.publishableKey==='string'&&x.publishableKey.length>20}},config)
  assert.deepEqual(cfg,{status:200,keyValid:true})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await page.route('**/api/session/login',route=>route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'login_failed'})}))
  await page.locator('#email').fill('qa@example.invalid')
  await page.locator('#password').fill('synthetic-do-not-send')
  await page.locator('#login-button').click()
  await page.locator('#login-alert').waitFor()
  await page.waitForFunction(()=>document.querySelector('#login-alert')?.textContent?.includes('ایمیل یا رمز صحیح نیست'))
  assert.equal(await page.locator('#office-view').isVisible(),false)
  assert.deepEqual(errors,[])
  await context.close()
 }
 // All auth/office mutations intercepted. The server receives ZERO genuine login credentials.
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'fa-AF'})
 await installCandidate(context)
 const page=await context.newPage()
 const one='00000000-0000-4000-8000-000000000011'
 const cookie='__Host-fp-office-session=synthetic-intercept-cookie; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'
 let state='received',writes=0,reads=0,loginCount=0
 await context.route('**/api/session',async route=>{
  const req=route.request()
  assert.equal(req.headers()['x-fp-office-request'],'same-origin')
  const present=(req.headers().cookie||'').includes('__Host-fp-office-session=synthetic-intercept-cookie')
  return route.fulfill({status:present?200:401,contentType:'application/json',body:JSON.stringify(present?{authenticated:true}:{error:'sign_in_required'})})
 })
 await context.route('**/api/session/login',async route=>{
  const request=route.request(),body=request.postDataJSON()
  assert.equal(request.method(),'POST')
  assert.deepEqual(body,{email:'qa@example.invalid',password:'synthetic-only',remember:true})
  assert.equal(request.headers().authorization,undefined)
  loginCount++
  return route.fulfill({status:200,headers:{'Set-Cookie':cookie,'Content-Type':'application/json'},body:JSON.stringify({authenticated:true})})
 })
 await context.route('**/api/office**',async route=>{
  const req=route.request()
  assert.equal(req.headers()['x-fp-office-request'],'same-origin')
  assert.equal(req.headers().authorization,undefined,'JWT must never be exposed to the page')
  if(req.method()==='POST'){
   const data=req.postDataJSON()
   assert.deepEqual(data,{id:one,expected:'received',status:'reviewing'})
   writes++;state='reviewing'
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:one,status:state})})
  }
  reads++
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:one,service:'synthetic visa',destination:'synthetic',variant:'',contact:'qa@example.invalid',status:state,created_at:'2026-10-31T00:00:00Z'}])})
 })
 await context.route('**/api/session/logout',route=>route.fulfill({status:200,headers:{'Set-Cookie':'__Host-fp-office-session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0','Content-Type':'application/json'},body:JSON.stringify({signedOut:true})}))
 await page.goto(base,{waitUntil:'domcontentloaded'})
 await page.locator('#email').fill('qa@example.invalid')
 await page.locator('#password').fill('synthetic-only')
 await page.locator('#remember-device').check()
 await page.locator('#login-button').click()
 await page.locator('#office-view').waitFor({state:'visible'})
 assert.equal(loginCount,1)
 assert.equal(await page.locator('.case').count(),1)
 const stored=await context.cookies(base)
 assert.ok(stored.some(x=>x.name==='__Host-fp-office-session'&&x.httpOnly&&x.secure),'trusted-device cookie must be HttpOnly and Secure')
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('fajr-office-qa-session-v1')),null)
 await page.reload({waitUntil:'domcontentloaded'})
 await page.locator('#office-view').waitFor({state:'visible'})
 assert.equal(loginCount,1,'refresh must not ask for login again')
 await page.locator('.case select').selectOption('reviewing')
 assert.equal(await page.locator('#confirm').evaluate(el=>el.open),true)
 await page.locator('#confirm-yes').click()
 await page.waitForFunction(()=>document.querySelector('.case .status')?.textContent==='در حال بررسی')
 assert.equal(writes,1)
 assert.ok(reads>=3)
 await page.locator('#logout').click()
 await page.locator('#login-view').waitFor({state:'visible'})
 assert.equal(await page.locator('#office-view').isVisible(),false)
 assert.equal((await context.cookies(base)).some(x=>x.name==='__Host-fp-office-session'),false)
 await context.close()

 const deniedContext=await browser.newContext({viewport:{width:390,height:844}})
 await installCandidate(deniedContext)
 const denied=await deniedContext.newPage()
 await denied.route('**/api/session/login',route=>route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'access_denied'})}))
 await denied.goto(base,{waitUntil:'domcontentloaded'})
 await denied.locator('#email').fill('qa@example.invalid')
 await denied.locator('#password').fill('synthetic-only')
 await denied.locator('#login-button').click()
 await denied.waitForFunction(()=>document.querySelector('#login-alert')?.textContent?.includes('دسترسی'))
 assert.equal(await denied.locator('#login-view').isVisible(),true)
 assert.equal(await denied.locator('#office-view').isVisible(),false)
 await deniedContext.close()

 // Self-service recovery: no genuine account email or password reset is sent.
 const recoveryContext=await browser.newContext({viewport:{width:390,height:844}})
 await installCandidate(recoveryContext)
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
 assert.equal(await recoveryPage.locator('#login-alert').getAttribute('data-kind'),'success','successful password reset must not display as error')
 assert.equal(await recoveryPage.locator('#login-alert').evaluate(el=>getComputedStyle(el).color),'rgb(23, 102, 87)','successful password reset must have green text')
 assert.equal(changed,1)
 assert.equal(await recoveryPage.locator('#password-reset-view').isVisible(),false)
 assert.equal(await recoveryPage.locator('#login-view').isVisible(),true)
 await recoveryContext.close()
 console.log('PASS: recovery email request and password update with intercepted synthetic tokens, no actual email sent')

 console.log('PASS: synthetic full office login -> list -> confirm -> audited API request -> refresh -> logout, and visible access denial')

 console.log('PASS: candidate Office loads at 390/1280 using synthetic config; no deployed BFF acceptance inferred')

 console.log('PASS: secure-cookie synthetic login, reload persistence, list/update, denied access, logout, recovery')
}finally{await browser.close()}
