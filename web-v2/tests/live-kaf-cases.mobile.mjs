import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {chromium} from 'playwright'
const root=fileURLToPath(new URL('../dist-office-preview/',import.meta.url))
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const publicOrigin='https://f8ffa514.fajr-parsa-qa.pages.dev'
const caseRow={id:'00000000-0000-4000-8000-000000000001',
 workspaceId:'d5072836-0d50-4dfa-88dc-596e9befd276',company:'fajr',
 code:'FP-CASE-001',title:'Synthetic Fajr Service Case',status:'در جریان',
 dueDate:'2026-12-01',assignedTo:'Synthetic owner',nextAction:'Synthetic document follow-up',
 revision:2,updatedAt:'2026-11-18T12:00:00Z'}
test('G7 S21 360/393: private cases and follow-ups use scoped KAF data, guest/403 fail closed and public preview isolated',async()=>{
 const html=await readFile(resolve(root,'office-preview.html'))
 const browser=await chromium.launch({headless:true})
 try{
  await mkdir('test-results',{recursive:true})
  for(const width of [360,393]){
   let auth='guest'
   let backendReads=0
   const calls=[],errors=[]
   const context=await browser.newContext({viewport:{width,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
   const page=await context.newPage()
   page.on('pageerror',e=>errors.push(e.message))
   await page.route('**/*',async route=>{
    const u=new URL(route.request().url())
    if(u.origin!==origin&&u.origin!==publicOrigin){await route.abort();return}
    if(u.pathname==='/console'||u.pathname==='/office-preview'){
     await route.fulfill({status:200,body:html,contentType:'text/html; charset=utf-8'})
     return
    }
    if(u.pathname.startsWith('/assets/')&&/^[a-zA-Z0-9._-]+$/.test(u.pathname.slice(8))){
     const name=u.pathname.slice(8)
     const mime=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.woff2')?'font/woff2':'application/octet-stream'
     await route.fulfill({status:200,body:await readFile(resolve(root,'assets',name)),contentType:mime})
     return
    }
    if(u.pathname==='/api/kaf/cases'){
     backendReads++
     calls.push({url:u.toString(),method:route.request().method(),
      header:route.request().headers()['x-fp-office-request']})
     if(auth==='denied'||auth==='guest'){
      await route.fulfill({status:auth==='guest'?401:403,contentType:'application/json',
       body:JSON.stringify({error:auth==='guest'?'sign_in_required':'access_denied'})})
      return
     }
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([caseRow])})
     return
    }
    await route.fulfill({status:404,body:'Not Found'})
   })
   await page.goto(origin+'/console#/cases',{waitUntil:'networkidle',timeout:20000})
   const list=page.locator('.fpx-live-kaf')
   await list.waitFor()
   await list.getByRole('alert').filter({hasText:'نشست امن دفتر پایان یافته'}).waitFor()
   assert.equal(await list.getByText('Synthetic Fajr Service Case').count(),0)
   auth='owner'
   await list.getByRole('button',{name:'تازه‌سازی'}).click()
   await list.getByRole('heading',{name:'پرونده‌های واقعی KAF'}).waitFor()
   await list.getByText('Synthetic Fajr Service Case').waitFor()
   assert.equal(await list.locator('.fpx-live-kaf-card').count(),1)
   assert.equal(await list.locator('button').filter({hasText:'ثبت'}).count(),0)
   assert.ok(calls.every(c=>c.method==='GET'&&c.header==='same-origin'&&c.url.includes('offset=0')))
   assert.equal(await page.locator('.fpx-content-head').count(),0,'No fake create button or duplicate heading')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'S21 horizontal overflow')
   await page.screenshot({path:'test-results/fp-g7-'+width+'-kaf-cases.png',fullPage:true})
   auth='denied'
   await list.getByRole('button',{name:'تازه‌سازی'}).click()
   await list.getByRole('alert').filter({hasText:'مجوز دیدن پرونده‌های KAF'}).waitFor()
   assert.equal(await list.locator('.fpx-live-kaf-card').count(),0,'403 must clear previous records')
   auth='owner'
   await page.goto(origin+'/console#/tasks',{waitUntil:'networkidle',timeout:20000})
   const follow=page.locator('.fpx-live-kaf')
   await follow.getByRole('heading',{name:'پیگیری‌های ثبت‌شده در پرونده‌های KAF'}).waitFor()
   await follow.getByText('Synthetic document follow-up').waitFor()
   assert.equal(await follow.locator('.fpx-live-kaf-card').count(),1)
   assert.ok(await follow.getByText('این صفحه سامانهٔ وظایف مستقل نیست').count())
   const before=backendReads
   await page.goto(publicOrigin+'/office-preview#/cases',{waitUntil:'networkidle',timeout:20000})
   assert.equal(backendReads,before,'Public design preview must never fetch private KAF records')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true)
   assert.deepEqual(errors,[])
   await context.close()
  }
 }finally{await browser.close()}
})
