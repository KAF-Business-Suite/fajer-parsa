import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {chromium} from 'playwright'
import {SITE_JS} from '../../../workers/fajr-office-qa/site-settings-ui.mjs'

const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const address={fa:'کابل',ps:'کابل',en:'Kabul',ar:'كابل'}
const hours={fa:'۹–۵',ps:'۹–۵',en:'9–5',ar:'٩–٥'}
const notice={fa:'آزمایش ساختگی',ps:'ازموينه',en:'Synthetic QA',ar:'اختبار'}
const blank={contact:{whatsapp:'93700123456',email:'qa@example.invalid'},design:{fontPreset:'vazirmatn-manrope'},office:{address,hours},content:{notice,faq:[]}}
test('browser script compiles as ordinary JavaScript, independent of worker module',()=>{
 assert.doesNotThrow(()=>new Function(SITE_JS))
})
test('live QA four-language mobile/desktop Site Settings UI, synthetic APIs only',async()=>{
 await mkdir('test-results',{recursive:true})
 const browser=await chromium.launch({headless:true})
 try{
  for(const width of [360,393,1280]){
   const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1,locale:'en-US'})
   const page=await context.newPage()
   const errors=[]
   page.on('pageerror',e=>errors.push(String(e)))
   const calls=[]
   let draft=structuredClone(blank),draftRevision='synthetic-a-0001'
   let publishedRevision=null,published=null
   const response=()=>({draft,draftRevision,publishedRevision,published,canEdit:true,canPublish:true,history:[]})
   await page.route('**/api/site-settings/**',async route=>{
    const req=route.request();const action=new URL(req.url()).pathname.split('/').at(-1)
    const body=req.method()==='POST'?req.postDataJSON():null
    calls.push({action,method:req.method(),body})
    if(action==='draft'&&req.method()==='POST'){
      if(body?.expected!==draftRevision)return route.fulfill({status:409,json:{error:'stale_revision'}})
      draft=body.draft;draftRevision='synthetic-b-0002'
    }
    if(action==='preview'&&(!draft.contact.whatsapp||!draft.contact.email))
      return route.fulfill({status:400,json:{error:'invalid_request'}})
    if(action==='publish'){
      if(!body?.confirmed||body.expected!==draftRevision||body.expectedPublished!==(publishedRevision||''))
       return route.fulfill({status:409,json:{error:'stale_revision'}})
      publishedRevision='synthetic-c-0003'
      published={...draft,revision:publishedRevision}
    }
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())})
   })
   const res=await page.goto(origin+'/site-settings',{waitUntil:'domcontentloaded',timeout:20000})
   assert.equal(res.status(),200)
   await page.locator('[data-field="contact.whatsapp"]').waitFor({state:'visible',timeout:15000})
   assert.equal(await page.locator('[data-field="contact.whatsapp"]').inputValue(),'93700123456')
   assert.equal(await page.locator('#language option').count(),4)
   const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)
   assert.equal(noOverflow,true,'horizontal overflow at width='+width)
   await page.locator('#language').selectOption('en')
   assert.equal(await page.locator('html').getAttribute('dir'),'ltr')
   assert.match(await page.locator('h1').innerText(),/Website management/)
   await page.locator('#language').selectOption('ps')
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
   await page.locator('#language').selectOption('ar')
   assert.match(await page.locator('h1').innerText(),/إدارة الموقع/)
   await page.locator('#language').selectOption('fa')
   await page.locator('[data-field="content.notice.fa"]').fill('نسخهٔ آزمایشی فجرپارسا')
   await page.locator('#save').click()
   await page.getByText('پیش‌نویس ذخیره و از سرور دوباره خوانده شد.').waitFor({state:'visible'})
   assert.equal(draft.content.notice.fa,'نسخهٔ آزمایشی فجرپارسا')
   await page.locator('#preview').click()
   await page.locator('#preview-modal:not([hidden])').waitFor({state:'visible'})
   assert.match(await page.locator('#preview-body').innerText(),/نسخهٔ آزمایشی فجرپارسا/)
   await page.locator('#preview-close').click()
   page.once('dialog',async dialog=>dialog.accept())
   await page.locator('#publish').click()
   await page.getByText('نسخهٔ آزمایشی نشر و بازخوانی شد.').waitFor({state:'visible'})
   assert.equal(published.content.notice.fa,'نسخهٔ آزمایشی فجرپارسا')
   assert.equal(calls.filter(x=>x.action==='publish').length,1)
   assert.deepEqual(errors,[])
   await page.screenshot({path:'test-results/fajr-site-settings-'+width+'.png',fullPage:true})
   await context.close()
  }
 } finally {await browser.close()}
})
