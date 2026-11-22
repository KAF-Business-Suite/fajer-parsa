import test from 'node:test'
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import worker from '../../workers/fajr-office-qa/worker.mjs'

const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const auth='https://krzxajtrhvupyywovdzy.supabase.co'

test('FP-ADMIN-AUTH-01: real KAF sign-in UI uses BFF, synthetic recovery and independent visual shell',async()=>{
 const browser=await chromium.launch({headless:true})
 try{
  for(const width of [393,1280]){
   const context=await browser.newContext({viewport:{width,height:840},locale:'fa-AF'})
   const page=await context.newPage(),pageErrors=[]
   const authCalls=[]
   let rejectLogin=true,logoutCount=0
   page.on('pageerror',e=>pageErrors.push(e.message))
   await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url())
    if(url.origin===auth){
     const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'}
     if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''})
     if(url.pathname.endsWith('/config'))return route.fulfill({status:200,headers:{...cors,'Content-Type':'application/json'},body:JSON.stringify({publishableKey:'sb_publishable_synthetic_test_key'})})
     if(url.pathname==='/auth/v1/recover'){
      assert.equal(req.method(),'POST')
      assert.deepEqual(req.postDataJSON(),{email:'qa@example.invalid'})
      assert.equal(url.searchParams.get('redirect_to'),origin+'/console?mode=recovery')
      authCalls.push('recover')
      return route.fulfill({status:200,headers:{...cors,'Content-Type':'application/json'},body:'{}'})
     }
     if(url.pathname==='/auth/v1/user'){
      assert.equal(req.method(),'PUT')
      assert.equal(req.headers().authorization,'Bearer synthetic-recovery-token')
      assert.equal(req.postDataJSON().password,'synthetic-safe-password-123')
      authCalls.push('password-update')
      return route.fulfill({status:200,headers:{...cors,'Content-Type':'application/json'},body:'{}'})
     }
     return route.abort('blockedbyclient')
    }
    if(url.origin!==origin)return route.abort('blockedbyclient')
    if(url.pathname==='/api/session/login'){
     assert.equal(req.method(),'POST')
     assert.equal(req.headers()['x-fp-office-request'],'same-origin')
     const payload=req.postDataJSON()
     assert.equal(payload.email,'qa@example.invalid')
     assert.equal(payload.password,rejectLogin?'synthetic-negative':'synthetic-positive')
     authCalls.push('login')
     if(rejectLogin)return route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'login_failed'})})
     return route.fulfill({status:200,contentType:'application/json',headers:{'Set-Cookie':'__Host-fp-office-session=synthetic-test-cookie; Path=/; Secure; HttpOnly; SameSite=Lax'},body:JSON.stringify({authenticated:true})})
    }
    if(url.pathname==='/api/session/logout'){
     logoutCount++
     return route.fulfill({status:200,contentType:'application/json',headers:{'Set-Cookie':'__Host-fp-office-session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'},body:JSON.stringify({signedOut:true})})
    }
    if(url.pathname==='/console'&&url.searchParams.get('mode')!=='recovery'&&((await req.allHeaders()).cookie||'').includes('__Host-fp-office-session=synthetic-test-cookie'))
     return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><body><main id="root"><h1>Authorized synthetic Admin Console</h1></main></body></html>'})
    if(req.method()!=='GET')return route.abort('blockedbyclient')
    const result=await worker.fetch(new Request(req.url(),{method:'GET',headers:req.headers()}),{})
    return route.fulfill({status:result.status,headers:Object.fromEntries(result.headers.entries()),body:await result.text()})
   })
   await page.goto(origin+'/console',{waitUntil:'networkidle'})
   assert.equal(await page.title(),'Admin Console | KAF')
   await page.getByRole('heading',{name:'ورود به Admin Console'}).waitFor()
   assert.equal(await page.locator('#login-view').isVisible(),true)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true)
   assert.equal(await page.getByRole('button',{name:'ثبت‌نام'}).count(),0)
   await page.locator('#email').fill('qa@example.invalid')
   await page.locator('#password').fill('synthetic-negative')
   await page.locator('#login-button').click()
   await page.waitForFunction(()=>document.querySelector('#login-alert')?.textContent?.includes('تأیید نشد'))
   assert.equal(await page.locator('#login-view').isVisible(),true)
   rejectLogin=false
   await page.locator('#password').fill('synthetic-positive')
   await page.locator('#remember-device').check()
   await page.locator('#login-button').click()
   await page.waitForURL('**/console#/overview')
   await page.getByRole('heading',{name:'Authorized synthetic Admin Console'}).waitFor()
   assert.deepEqual(authCalls.filter(v=>v==='login'),['login','login'])
   assert.equal((await context.cookies(origin)).some(c=>c.name==='__Host-fp-office-session'&&c.httpOnly&&c.secure),true)

   const recoveryPage=await context.newPage()
   recoveryPage.on('pageerror',e=>pageErrors.push(e.message))
   await recoveryPage.goto(origin+'/console?mode=recovery',{waitUntil:'networkidle'})
   await recoveryPage.locator('#recover-view').waitFor({state:'visible'})
   await recoveryPage.locator('#recovery-email').fill('qa@example.invalid')
   await recoveryPage.locator('#recover-button').click()
   await recoveryPage.waitForFunction(()=>document.querySelector('#recover-alert')?.textContent?.includes('لینک بازیابی'))
   assert.equal(authCalls.includes('recover'),true)
   await recoveryPage.goto(origin+'/console?mode=recovery#access_token=synthetic-recovery-token&type=recovery',{waitUntil:'networkidle'})
   await recoveryPage.locator('#reset-view').waitFor({state:'visible'})
   assert.equal(new URL(recoveryPage.url()).hash,'','Recovery token must disappear from address bar')
   await recoveryPage.locator('#new-password').fill('synthetic-safe-password-123')
   await recoveryPage.locator('#confirm-password').fill('synthetic-safe-password-123')
   await recoveryPage.locator('#reset-button').click()
   await recoveryPage.waitForFunction(()=>document.querySelector('#login-alert')?.textContent?.includes('رمز جدید ثبت شد'))
   assert.equal(authCalls.includes('password-update'),true)
   assert.equal(logoutCount,1)
   assert.equal(new URL(recoveryPage.url()).pathname,'/console')
   assert.deepEqual(pageErrors,[])
   await context.close()
  }
 }finally{await browser.close()}
})
