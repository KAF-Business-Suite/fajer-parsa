import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {preview} from 'vite'
import {chromium} from 'playwright'

const configFile=fileURLToPath(new URL('../vite.office.config.ts',import.meta.url))
test('S21: mobile resources, non-destructive detach/relink, appearance, native Back and FA/EN',async()=>{
 await mkdir('test-results',{recursive:true})
 const server=await preview({configFile,preview:{host:'127.0.0.1',port:4179,strictPort:false}})
 const port=server.httpServer.address().port
 const browser=await chromium.launch({headless:true})
 const origin='http://127.0.0.1:'+port+'/office-preview.html'
 const external=[]
 try{
  for(const width of [360,393]){
   const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1,hasTouch:true,isMobile:true,reducedMotion:'reduce'})
   const page=await context.newPage(),errors=[]
   page.on('pageerror',e=>errors.push(String(e)))
   page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:'+port+'/'))external.push(req.url())})
   await page.goto(origin+'#/resources',{waitUntil:'networkidle'})
   await page.getByRole('heading',{name:'منابع و سایت‌های من'}).waitFor()
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
   const viewportMetrics=await page.evaluate(()=>({innerWidth,screenWidth:screen.width,visualWidth:visualViewport?.width,scrollWidth:document.documentElement.scrollWidth}))
   console.log('FP_S21_VIEWPORT',width,JSON.stringify(viewportMetrics))
   assert.equal(viewportMetrics.innerWidth,width,'mobile layout width must equal device CSS viewport, no shrink-to-fit')
   assert.equal(await page.locator('.fpx-mobile-tabs').isVisible(),true)
   assert.equal(await page.locator('.fpx-resource-entry').count(),3)
   const categoryLayout=await page.locator('.fpx-resource-segments').evaluate(el=>{
     const parent=el.getBoundingClientRect()
     const tabs=[...el.querySelectorAll('[role=tab]')].map(tab=>{
       const r=tab.getBoundingClientRect()
       return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,visible:getComputedStyle(tab).visibility==='visible'}
     })
     return {tabCount:tabs.length,rows:new Set(tabs.map(t=>Math.round(t.y))).size,
       allInside:tabs.every(t=>t.visible&&t.width>=55&&t.height>=44&&t.x>=parent.left-1&&t.right<=parent.right+1),
       horizontalOverflow:el.scrollWidth>el.clientWidth+2}
   })
   assert.equal(categoryLayout.tabCount,5,'all five categories are present at '+width)
   assert.equal(categoryLayout.rows,2,'all category tabs visible in two rows on S21 '+width)
   assert.equal(categoryLayout.allInside,true,'no category clipped off screen at '+width)
   assert.equal(categoryLayout.horizontalOverflow,false,'category strip must not need horizontal scrolling')
   await page.locator('.fpx-resource-segments button').last().click()
   assert.equal(await page.locator('.fpx-resource-entry').count(),0,'integration filter works by touch')
   await page.locator('.fpx-resource-segments button').first().click()
   assert.equal(await page.locator('.fpx-resource-entry').count(),3)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'initial S21 overflow '+width)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-resources.png',fullPage:true})
   await page.getByRole('button',{name:'افزودن منبع'}).first().click()
   let dialog=page.getByRole('dialog')
   await dialog.locator('input[name="resourceName"]').fill('Second QA Site')
   await dialog.locator('input[name="resourceUrl"]').fill('http://127.0.0.1/admin')
   await dialog.getByRole('button',{name:'افزودن به کنسول'}).click()
   await dialog.getByRole('alert').filter({hasText:'HTTPS'}).waitFor()
   await dialog.locator('input[name="resourceUrl"]').fill('https://example.com/mobile')
   await dialog.getByRole('button',{name:'افزودن به کنسول'}).click()
   await page.locator('.fpx-resource-detail-head [data-slot="card-title"]').filter({hasText:'Second QA Site'}).waitFor()
   await page.getByText('مالکیت و اختیار ویرایش هنوز تأیید نشده است.',{exact:false}).waitFor()
   assert.equal(await page.getByText('تا تأیید مجوز غیرفعال').count(),5)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-resource-detail.png',fullPage:true})
   await page.getByRole('button',{name:'جداکردن از کنسول'}).click()
   dialog=page.getByRole('dialog')
   await dialog.getByText('سایت، دامنه، عکس‌ها، دیتابیس و مخزن واقعی حذف نمی‌شوند.',{exact:false}).waitFor()
   await dialog.getByRole('button',{name:'فقط از کنسول جدا شود'}).click()
   await page.getByRole('heading',{name:'منابع و سایت‌های من'}).waitFor()
   assert.equal(await page.locator('.fpx-resource-entry').count(),3)
   await page.locator('.fpx-resource-check').click()
   assert.equal(await page.locator('.fpx-resource-check input').isChecked(),true,'Touch on entire label toggles detached filter')
   await page.locator('.fpx-resource-entry').filter({hasText:'Second QA Site'}).click()
   await page.getByRole('button',{name:'بازافزودن به فهرست'}).click()
   await page.getByRole('button',{name:'بازگشت'}).click()
   await page.locator('.fpx-resource-entry').filter({hasText:'Second QA Site'}).waitFor()
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'detail overflow '+width)
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-resource-list.png',fullPage:true})
   await page.locator('.fpx-resource-entry').filter({hasText:'Second QA Site'}).click()
   await page.goBack()
   await page.getByRole('heading',{name:'منابع و سایت‌های من'}).waitFor()
   await page.locator('.fpx-lang-switch select').selectOption('en')
   await page.getByRole('heading',{name:'My sites & resources'}).waitFor()
   assert.equal(await page.locator('.fpx-resource-segments button').count(),5,'all categories remain in EN')
   assert.equal(await page.locator('.fpx-resource-segments').evaluate(el=>el.scrollWidth<=el.clientWidth+2),true,'no category clipping in EN')
   const navHit=await page.locator('.fpx-mobile-tabs button').nth(4).evaluate(el=>{
      const rect=el.getBoundingClientRect(),nav=el.parentElement.getBoundingClientRect()
      const midX=rect.x+rect.width/2,midY=rect.y+rect.height/2
      const target=document.elementFromPoint(midX,midY)
      return {rect:{x:rect.x,y:rect.y,w:rect.width,h:rect.height},nav:{x:nav.x,y:nav.y,w:nav.width,h:nav.height},
        hit:target?.className||target?.tagName,tag:target?.tagName,
        innerWidth,innerHeight,docWidth:document.documentElement.scrollWidth,scrollY,
        computedNav:{z:getComputedStyle(el.parentElement).zIndex,position:getComputedStyle(el.parentElement).position},
        computedButton:{z:getComputedStyle(el).zIndex,position:getComputedStyle(el).position}}
   })
   console.log('FP_S21_BOTTOM_NAV_HIT',JSON.stringify(navHit))
   await page.locator('.fpx-mobile-tabs button').nth(4).click({timeout:7000})
   await page.getByRole('dialog').getByText('Platform administration').waitFor()
   await page.getByRole('dialog').getByRole('button',{name:'Design system'}).click()
   await page.getByRole('heading',{name:'Appearance & personalization'}).waitFor()
   await page.getByRole('button',{name:/Dark/}).click()
   assert.equal(await page.locator('.fpx-root').getAttribute('data-theme'),'dark')
   await page.getByRole('button',{name:/Ocean/}).click()
   assert.equal(await page.locator('.fpx-root').getAttribute('data-tone'),'ocean')
   await page.getByRole('button',{name:/Extra rounded/}).click()
   assert.equal(await page.locator('.fpx-root').getAttribute('data-corners'),'extra')
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-appearance.png',fullPage:true})
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'appearance overflow '+width)
   assert.deepEqual(errors,[],'React error at width '+width)
   await context.close()
  }
  assert.deepEqual(external,[],'No real provider/data network requests')
 }finally{
   await browser.close()
   await new Promise(resolve=>server.httpServer.close(resolve))
 }
})
