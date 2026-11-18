import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {chromium} from 'playwright'

const root=fileURLToPath(new URL('../dist-office-preview/',import.meta.url))
const privateOrigin='https://fajr-office-qa.khoojafahim.workers.dev'
const publicOrigin='https://f8ffa514.fajr-parsa-qa.pages.dev'
const row={id:'00000000-0000-4000-8000-000000000001',service:'QA Synthetic Service',destination:'Sample',contact:'only@example.invalid',status:'received'}

test('S21: private 46-module console shows ONLY approved real-path requests; never leaks into public preview',async()=>{
 const html=await readFile(resolve(root,'office-preview.html'))
 const browser=await chromium.launch({headless:true})
 try{
  await mkdir('test-results',{recursive:true})
  for(const width of [360,393]){
   let mode='guest'
   const requests=[]
   const context=await browser.newContext({viewport:{width,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
   const page=await context.newPage()
   const errors=[]
   page.on('pageerror',error=>errors.push(String(error)))
   await page.route('**/*',async route=>{
    const u=new URL(route.request().url())
    if(u.origin!==privateOrigin&&u.origin!==publicOrigin){
     requests.push({unexpected:u.origin,path:u.pathname})
     await route.abort()
     return
    }
    if(u.pathname==='/console'||u.pathname==='/office-preview'){
     await route.fulfill({status:200,body:html,contentType:'text/html; charset=utf-8'});return
    }
    if(u.pathname.startsWith('/assets/')&&/^[a-zA-Z0-9._-]+$/.test(u.pathname.slice(8))){
     const name=u.pathname.slice(8)
     const mime=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.woff2')?'font/woff2':'application/octet-stream'
     await route.fulfill({status:200,body:await readFile(resolve(root,'assets',name)),contentType:mime});return
    }
    if(u.pathname==='/api/office'){
     requests.push({path:u.pathname,offset:u.searchParams.get('offset'),method:route.request().method(),header:route.request().headers()['x-fp-office-request']})
     if(mode==='guest'){await route.fulfill({status:401,contentType:'application/json',body:'{"error":"sign_in_required"}'});return}
     if(mode==='limited'){await route.fulfill({status:429,contentType:'application/json',body:'{"error":"rate_limited"}'});return}
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([row])});return
    }
    await route.fulfill({status:404,body:'Not Found'})
   })
   await page.goto(privateOrigin+'/console#/requests',{waitUntil:'networkidle',timeout:20000})
   await page.locator('.fpx-live-office').waitFor()
   await page.getByRole('alert').filter({hasText:'نشست ورود پایان یافته'}).waitFor()
   assert.equal(await page.getByText('QA Synthetic Service').count(),0)
   mode='owner'
   await page.getByRole('button',{name:'تازه‌سازی'}).click()
   await page.getByText('QA Synthetic Service').waitFor()
   // FP-TYPE-01: the exact Arabic + Latin variable font must load locally in QA.
   await page.evaluate(()=>document.fonts.ready)
   const fontAudit=await page.evaluate(()=>{
    const family=getComputedStyle(document.querySelector('.fpx-root')).fontFamily
    const titleFamily=getComputedStyle(document.querySelector('.fpx-live-office-top h2')).fontFamily
    const buttonFamily=getComputedStyle(document.querySelector('.fpx-mobile-tabs button.active')).fontFamily
    return {family,titleFamily,buttonFamily,arabic:document.fonts.check('600 16px "Estedad Variable"','درخواست‌ها'),latin:document.fonts.check('600 16px "Estedad Variable"','Fajr Parsa')}
   })
   assert.ok(fontAudit.family.includes('Estedad Variable'),JSON.stringify(fontAudit))
   assert.ok(fontAudit.titleFamily.includes('Estedad Variable'),JSON.stringify(fontAudit))
   assert.ok(fontAudit.buttonFamily.includes('Estedad Variable'),JSON.stringify(fontAudit))
   assert.equal(fontAudit.arabic,true,JSON.stringify(fontAudit))
   assert.equal(fontAudit.latin,true,JSON.stringify(fontAudit))
   assert.match(await page.locator('.fpx-live-office-count').innerText(),/1/)
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'No mobile horizontal overflow')
   const nav=page.locator('.fpx-mobile-tabs')
   assert.equal(await nav.locator('button').count(),5,'Exactly five navigation tabs')
   assert.equal(await nav.locator('button[aria-current="page"]').count(),1,'Only one active navigation tab')
   assert.match(await nav.locator('button[aria-current="page"]').innerText(),/درخواست‌ها/)
   assert.equal(await page.locator('.fpx-content-head').count(),0,'No duplicate heading above the live requests card')
   const layout=await page.evaluate(()=>{
    const el=(s)=>document.querySelector(s).getBoundingClientRect()
    const buttons=[...document.querySelectorAll('.fpx-private-shortcuts a,.fpx-private-shortcuts button')]
    return{nav:el('.fpx-mobile-tabs').height,header:el('.fpx-header').height,
      shortcuts:buttons.map(x=>({height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width})),
      liveCard:el('.fpx-live-office').width,viewport:innerWidth}
   })
   assert.ok(layout.nav<=64,'Bottom navigation should be compact: '+JSON.stringify(layout))
   assert.ok(layout.header<=58,'Header should be compact: '+JSON.stringify(layout))
   assert.equal(layout.shortcuts.length,4)
   assert.ok(layout.shortcuts.every(b=>b.height>=44&&b.width>=44),'Shortcuts must remain touchable')
   assert.ok(layout.liveCard<=layout.viewport,'Live card must fit viewport')
   await nav.locator('button').last().click()
   await page.getByRole('dialog',{name:/همهٔ بخش‌ها/}).waitFor()
   assert.equal(await nav.locator('button[aria-current="page"]').count(),1)
   assert.match(await nav.locator('button[aria-current="page"]').innerText(),/بیشتر/)
   await page.getByRole('button',{name:'بستن'}).click()
   assert.match(await nav.locator('button[aria-current="page"]').innerText(),/درخواست‌ها/)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-private-requests.png',fullPage:true})
   mode='limited'
   await page.getByRole('button',{name:'تازه‌سازی'}).click()
   await page.getByRole('alert').filter({hasText:'محدودیت درخواست‌های دفتر'}).waitFor()
   assert.equal(await page.getByText('QA Synthetic Service').count(),0)
   assert.ok(requests.some(x=>x.path==='/api/office'&&x.offset==='0'&&x.method==='GET'&&x.header==='same-origin'))
   const count=requests.filter(x=>x.path==='/api/office').length
   await page.goto(publicOrigin+'/office-preview#/requests',{waitUntil:'networkidle',timeout:20000})
   assert.equal(await page.locator('.fpx-live-office').count(),0,'Public design must never read actual office records')
   assert.equal(requests.filter(x=>x.path==='/api/office').length,count)
   assert.deepEqual(errors,[],'Browser errors at '+width)
   assert.equal(requests.filter(x=>x.unexpected).length,0)
   await context.close()
  }
 }finally{await browser.close()}
})
