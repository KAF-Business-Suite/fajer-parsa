import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {preview} from 'vite'
import {chromium} from 'playwright'

const configFile=fileURLToPath(new URL('../vite.office.config.ts',import.meta.url))
const expected={
  fa:{heading:'کنسول مدیریت فجرپارسا',preview:'سفر را با اطمینان آغاز کنید'},
  en:{heading:'Fajr Parsa Administration',preview:'Begin your journey with confidence'}
}
test('Enterprise admin: 45-feature bilingual shell, independent four-language website, zero remote data',async()=>{
 await mkdir('test-results',{recursive:true})
 const server=await preview({configFile,preview:{host:'127.0.0.1',port:4178,strictPort:false}})
 const port=server.httpServer.address().port
 const origin='http://127.0.0.1:'+port+'/office-preview.html'
 const browser=await chromium.launch({headless:true})
 const external=[]
 try{
  for(const width of [393,1280]){
   const context=await browser.newContext({viewport:{width,height:852},deviceScaleFactor:1,reducedMotion:'reduce'})
   const page=await context.newPage()
   const errors=[]
   page.on('pageerror',error=>errors.push(String(error)))
   page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'+port+'/'))external.push(r.url())})
   const response=await page.goto(origin,{waitUntil:'networkidle',timeout:20000})
   assert.equal(response.status(),200)
   await page.getByRole('heading',{name:expected.fa.heading}).waitFor()
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
   assert.equal(await page.locator('.fpx-lang-switch select option').count(),2)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'horizontal scroll at '+width)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-home.png',fullPage:true})
   if(width===393){
    assert.equal(await page.locator('.fpx-mobile-tabs').isVisible(),true)
    await page.locator('.fpx-mobile-tabs button').filter({hasText:'وب‌سایت'}).click()
   }else{
    assert.equal(await page.locator('.fpx-sidebar').isVisible(),true)
    await page.locator('.fpx-sidebar .fpx-nav-item').filter({hasText:'مدیریت وب‌سایت'}).click()
   }
   await page.locator('.fpx-public-hero h2').waitFor()
   assert.match(await page.locator('.fpx-public-hero h2').textContent(),/سفر را با اطمینان/)
   assert.equal(await page.locator('.fpx-site-language option').count(),4)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-website.png',fullPage:true})
   for(const [lang,text] of [['ps','خپل سفر په ډاډ پیل کړئ'],['ar','ابدأ رحلتك بثقة'],['en','Begin your journey with confidence'],['fa','سفر را با اطمینان آغاز کنید']]){
    await page.locator('.fpx-site-language select').selectOption(lang)
    assert.equal(await page.locator('.fpx-public').getAttribute('lang'),lang)
    assert.match(await page.locator('.fpx-public-hero h2').innerText(),new RegExp(text))
   }
   // The admin language and website editorial languages must be independent.
   await page.locator('.fpx-lang-switch select').selectOption('en')
   await page.getByRole('heading',{name:'Website studio'}).waitFor()
   assert.equal(await page.locator('html').getAttribute('dir'),'ltr')
   assert.equal(await page.locator('.fpx-site-language select').inputValue(),'fa')
   await page.locator('.fpx-content-actions button').click()
   const dialog=page.getByRole('dialog')
   await dialog.getByText('This is a sample publishing workflow', {exact:false}).waitFor()
   await dialog.getByRole('button',{name:'Approve sample, not publish'}).click()
   await page.getByRole('status').filter({hasText:'Nothing was published.'}).waitFor()
   assert.equal(await dialog.count(),0)
   // The module builder uses a reusable local template without backend writes.
   if(width===393){
    // Builder is in the mobile More drawer; the five real tabs now include Requests.
    await page.locator('.fpx-mobile-tabs button').last().click()
    await page.locator('.fpx-mobile-drawer .fpx-drawer-list button').filter({hasText:'Module & page builder'}).click()
   }
   else{
    await page.locator('.fpx-group-head').filter({hasText:'Platform administration'}).click()
    await page.locator('.fpx-sidebar .fpx-nav-item').filter({hasText:'Module & page builder'}).click()
   }
   await page.getByRole('heading',{name:'Addable modules'}).waitFor()
   await page.getByRole('button',{name:'Add module'}).first().click()
   const creator=page.getByRole('dialog')
   await creator.locator('input').fill('QA Example Workspace')
   await creator.getByRole('button',{name:'Add to preview'}).click()
   await page.getByRole('heading',{name:'QA Example Workspace'}).waitFor()
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-builder.png',fullPage:true})
   // Owner security module is visible in the SAME shell. A design preview must
   // never make a real authenticated identity request or show invented statuses.
   await page.evaluate(()=>{location.hash='/security'})
   await page.getByRole('heading',{name:'Account identity & security'}).waitFor()
   await page.getByRole('status').filter({hasText:'Sign in to the private console'}).waitFor()
   assert.equal(await page.locator('.fpx-security-refresh').isDisabled(),true)
   assert.equal(await page.locator('.fpx-security-signout').count(),0)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-security.png',fullPage:true})
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'horizontal overflow after navigation at '+width)
   assert.deepEqual(errors,[],'browser console errors at '+width)
   await context.close()
  }
  assert.deepEqual(external,[],'Design preview may not send any external network requests')
 }finally{
   await browser.close()
   await new Promise(resolve=>server.httpServer.close(resolve))
 }
})
