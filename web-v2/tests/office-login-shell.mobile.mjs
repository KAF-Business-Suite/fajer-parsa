import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {chromium} from 'playwright'
import worker from '../../workers/fajr-office-qa/worker.mjs'

const office='https://fajr-office-qa.khoojafahim.workers.dev'
test('FP-ADMIN-AUTH-01: standalone KAF login on S21/mobile and desktop',async()=>{
 await mkdir('test-results',{recursive:true})
 const browser=await chromium.launch({headless:true})
 try{
  for(const width of [360,393,1280]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:width<800,hasTouch:width<800,reducedMotion:'reduce'})
   await context.addInitScript(()=>{localStorage.setItem('kaf-admin-auth-theme','dark')})
   const page=await context.newPage()
   const errors=[],attempts=[]
   page.on('pageerror',e=>errors.push(e.message))
   await page.route('**/*',async route=>{
    const u=new URL(route.request().url())
    if(u.origin!==office){await route.abort();return}
    if(u.pathname==='/api/session'){
     attempts.push({path:u.pathname,method:route.request().method()})
     await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'sign_in_required'})})
     return
    }
    if(['/','/console','/admin-auth.css','/admin-auth.js'].includes(u.pathname)){
     const response=await worker.fetch(new Request(office+u.pathname),{})
     await route.fulfill({status:response.status,body:await response.text(),contentType:response.headers.get('content-type')||'text/plain'})
     return
    }
    await route.fulfill({status:404,body:'Not found'})
   })
   await page.goto(office+'/console#/website',{waitUntil:'networkidle',timeout:20000})
   assert.equal(new URL(page.url()).pathname,'/console','Guest must stay at canonical /console while signing in')
   assert.equal(new URL(page.url()).hash,'#/website','Browser must retain requested module')
   assert.equal(new URL(page.url()).hash,'#/website','Selected private view stays in URL until login')
   await page.getByRole('heading',{name:'ورود به Admin Console'}).waitFor()
   assert.equal(await page.getByText('KAF BUSINESS SUITE', {exact:false}).count()>0,true)
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark')
   assert.equal(await page.locator('#login-view').isVisible(),true)
   assert.equal(await page.locator('input#email').getAttribute('autocomplete'),'username')
   assert.equal(await page.locator('input#password').getAttribute('autocomplete'),'current-password')
   assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily.includes('Estedad Variable')),true)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'No x-overflow at '+width)
   const targets=await page.locator('#email,#password,#login-button,#password-visibility').evaluateAll(nodes=>nodes.map(e=>({id:e.id,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})))
   assert.ok(targets.every(x=>x.width>40&&x.height>=36),JSON.stringify(targets))
   assert.ok(attempts.every(x=>x.method==='GET'),'Opening login does not mutate an account')
   await page.locator('#password').fill('synthetic-visual-only')
   assert.equal(await page.locator('#password').getAttribute('type'),'password')
   await page.locator('#password-visibility').click()
   assert.equal(await page.locator('#password').getAttribute('type'),'text')
   await page.locator('#password-visibility').click()
   assert.equal(await page.locator('#password').getAttribute('type'),'password')
   await page.screenshot({path:'test-results/kaf-admin-login-'+width+'-dark.png',fullPage:true})
   assert.deepEqual(errors,[],'No JS error at '+width)
   await context.close()
  }
 }finally{await browser.close()}
})
