import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {chromium} from 'playwright'
const root=fileURLToPath(new URL('../dist-office-preview/',import.meta.url))
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const id='00000000-0000-4000-8000-000000000001'
const base={id,service:'QA Synthetic Service',destination:'Synthetic',contact:'only@example.invalid'}
test('G6 mobile confirmation requires explicit owner click, verifies audited readback and denies stale/403',async()=>{
 const html=await readFile(resolve(root,'office-preview.html'))
 const browser=await chromium.launch({headless:true})
 try{
  await mkdir('test-results',{recursive:true})
  for(const width of [360,393]){
   let status='received',mode='success',posts=0,reads=0
   const calls=[],errors=[]
   const context=await browser.newContext({viewport:{width,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
   const page=await context.newPage()
   page.on('pageerror',e=>errors.push(e.message))
   await page.route('**/*',async route=>{
    const url=new URL(route.request().url())
    if(url.origin!==origin){await route.abort();return}
    if(url.pathname==='/console'){
     await route.fulfill({status:200,body:html,contentType:'text/html; charset=utf-8'})
     return
    }
    if(url.pathname.startsWith('/assets/')&&/^[a-zA-Z0-9._-]+$/.test(url.pathname.slice(8))){
     const name=url.pathname.slice(8)
     const mime=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.woff2')?'font/woff2':'application/octet-stream'
     await route.fulfill({status:200,body:await readFile(resolve(root,'assets',name)),contentType:mime})
     return
    }
    if(url.pathname==='/api/office'){
     const request=route.request(),method=request.method()
     calls.push({method,path:url.pathname,header:request.headers()['x-fp-office-request']})
     if(method==='POST'){
      posts++
      const payload=JSON.parse(request.postData())
      assert.deepEqual(Object.keys(payload).sort(),['expected','id','status'])
      assert.equal(payload.id,id)
      assert.equal(payload.expected,status)
      assert.equal(request.headers()['x-fp-office-request'],'same-origin')
      if(mode==='denied'){await route.fulfill({status:403,contentType:'application/json',body:'{"error":"access_denied"}'});return}
      if(mode==='conflict'){
       status='contacted'
       await route.fulfill({status:409,contentType:'application/json',body:'{"error":"refresh_required"}'})
       return
      }
      status=payload.status
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id,status})})
      return
     }
     reads++
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{...base,status}])})
     return
    }
    await route.fulfill({status:404,body:'Not Found'})
   })
   await page.goto(origin+'/console#/requests',{waitUntil:'networkidle',timeout:20000})
   await page.getByText('QA Synthetic Service').waitFor()
   await page.getByRole('button',{name:'تغییر وضعیت'}).click()
   const modal=page.getByRole('dialog',{name:'بررسی تغییر وضعیت'})
   await modal.waitFor()
   assert.equal(posts,0,'Opening the dialog must not mutate')
   assert.equal(await modal.getByRole('button',{name:'تأیید و ثبت'}).isDisabled(),false)
   await modal.getByRole('button',{name:'انصراف'}).last().click()
   assert.equal(posts,0,'Cancel must not mutate')
   await page.getByRole('button',{name:'تغییر وضعیت'}).click()
   await modal.getByRole('combobox').selectOption('reviewing')
   assert.equal(posts,0,'Choosing a status must not mutate')
   await modal.getByRole('button',{name:'تأیید و ثبت'}).click()
   await page.locator('.fpx-live-office-feedback[data-kind=success]').waitFor()
   assert.equal(posts,1,'One click means exactly one audited BFF POST')
   assert.ok(reads>=2,'Authoritative GET must follow POST')
   assert.equal(await page.locator('.fpx-live-office-row span[data-state=reviewing]').count(),1)
   assert.equal(await page.getByRole('dialog').count(),0)
   mode='denied'
   await page.getByRole('button',{name:'تغییر وضعیت'}).click()
   await modal.getByRole('combobox').selectOption('contacted')
   await modal.getByRole('button',{name:'تأیید و ثبت'}).click()
   await page.locator('.fpx-live-office-feedback[data-kind=error]').filter({hasText:'مجوز'}).waitFor()
   assert.equal(posts,2)
   assert.equal(status,'reviewing','Forbidden update must not mutate')
   assert.equal(await page.locator('.fpx-live-office-row span[data-state=reviewing]').count(),1)
   mode='conflict'
   await page.getByRole('button',{name:'تغییر وضعیت'}).click()
   await modal.getByRole('combobox').selectOption('closed')
   await modal.getByRole('button',{name:'تأیید و ثبت'}).click()
   await page.locator('.fpx-live-office-feedback[data-kind=error]').filter({hasText:'هم‌زمان'}).waitFor()
   await page.locator('.fpx-live-office-row span[data-state=contacted]').waitFor()
   assert.equal(posts,3)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true)
   assert.deepEqual(errors,[])
   assert.ok(calls.every(x=>x.header==='same-origin'))
   await page.screenshot({path:'test-results/fp-g6-'+width+'-status-confirm.png',fullPage:true})
   await context.close()
  }
 }finally{await browser.close()}
})
