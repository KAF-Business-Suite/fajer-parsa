import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {preview} from 'vite'
import {chromium} from 'playwright'

const configFile=fileURLToPath(new URL('../vite.office.config.ts',import.meta.url))
test('Fajr Admin V2: unified shell, four-language visual and mobile interaction, no real API',async()=>{
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
      const pageErrors=[]
      page.on('pageerror',error=>pageErrors.push(String(error)))
      page.on('request',request=>{
        if(!request.url().startsWith('http://127.0.0.1:'+port+'/'))external.push(request.url())
      })
      const response=await page.goto(origin,{waitUntil:'networkidle',timeout:20000})
      assert.equal(response.status(),200)
      await page.getByText('مرکز مدیریت یکپارچهٔ فجرپارسا').first().waitFor()
      assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'No horizontal overflow at '+width)
      await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-home.png',fullPage:true})
      if(width===393){
        assert.equal(await page.locator('.fp-bottom-nav').isVisible(),true)
        await page.locator('.fp-bottom-nav button').filter({hasText:'مدیریت وب‌سایت'}).click()
      }else{
        assert.equal(await page.locator('.fp-sidebar').isVisible(),true)
        await page.locator('.fp-sidebar button.fp-nav-item').filter({hasText:'مدیریت وب‌سایت'}).click()
      }
      await page.locator('.fp-public-mock').waitFor({state:'visible'})
      await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-website.png',fullPage:true})
      for(const [language,dir,expected] of [['fa','rtl','فجرپارسا، همراه مسیر شما'],['ps','rtl','فجرپارسا، ستاسو د لارې ملګری'],['en','ltr','Fajr Parsa, your journey companion'],['ar','rtl','فجر بارسا، رفيق رحلتك']]){
        await page.locator('.fp-language-select select').selectOption(language)
        assert.equal(await page.locator('html').getAttribute('dir'),dir)
        assert.match(await page.locator('.fp-public-hero h3').textContent(),new RegExp(expected))
      }
      await page.locator('.fp-language-select select').selectOption('en')
      await page.locator('.fp-page-actions button').filter({hasText:'Review changes'}).click()
      const modal=page.getByRole('dialog')
      await modal.getByText('This is a visual-only confirmation', {exact:false}).waitFor()
      await modal.getByRole('button',{name:'Confirm preview only'}).click()
      assert.equal(await modal.count(),0)
      await page.getByRole('status').filter({hasText:'nothing was published'}).waitFor()
      assert.deepEqual(pageErrors,[])
      await context.close()
    }
    assert.deepEqual(external,[],'Office preview must never contact Supabase, Cloudflare APIs or other external hosts')
  }finally{
    await browser.close()
    await new Promise(resolve=>server.httpServer.close(resolve))
  }
})
