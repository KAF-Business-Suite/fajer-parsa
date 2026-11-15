import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFile, mkdir} from 'node:fs/promises'
import {chromium} from 'playwright'

const html=await readFile(new URL('../public/office-preview/index.html',import.meta.url),'utf8')
const server=createServer((req,res)=>{
  if((req.url||'').startsWith('/')){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'})
    res.end(html)
  }
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const url='http://127.0.0.1:'+server.address().port+'/'
const browser=await chromium.launch({headless:true})
try{
  for(const lang of ['fa','ps','en','ar']){
    const context=await browser.newContext({viewport:{width:393,height:852},acceptDownloads:true})
    const page=await context.newPage()
    const errors=[],requests=[]
    page.on('pageerror',e=>errors.push(e.message))
    page.on('request',r=>requests.push(r.url()))
    await page.goto(url+'?lang='+lang,{waitUntil:'load'})
    assert.equal(await page.locator('html').getAttribute('dir'),lang==='en'?'ltr':'rtl')
    assert.equal(await page.locator('#lang').inputValue(),lang)
    assert.equal(await page.locator('#metrics .metric').count(),4)
    assert.equal(await page.locator('#recentRows .case').count(),4)
    assert.equal(requests.length,1,'Synthetic preview must not call an API or load network assets')
    for(const width of [320,360,393,768]){
      await page.setViewportSize({width,height:852})
      const dim=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}))
      assert.ok(dim.doc<=dim.viewport+1&&dim.body<=dim.viewport+1,'Horizontal overflow '+lang+' '+width+': '+JSON.stringify(dim))
    }
    await page.setViewportSize({width:393,height:852})
    await page.locator('#mobileNav [data-screen="cases"]').click()
    assert.equal(await page.locator('#screen-cases').isVisible(),true)
    await page.locator('#filters [data-filter="received"]').click()
    assert.equal(await page.locator('#caseRows .case').count(),2)
    await page.locator('#search').fill('FP-R-00001')
    assert.equal(await page.locator('#caseRows .case').count(),1)
    await page.locator('#caseRows .case').click()
    assert.equal(await page.locator('#shade').isVisible(),true)
    assert.equal(await page.locator('#details #statusEdit').inputValue(),'received')
    await page.locator('#statusEdit').selectOption('reviewing')
    await page.locator('#ownerEdit').selectOption('manager')
    await page.locator('#saveEdit').click()
    assert.equal(await page.locator('#shade').isVisible(),false)
    await page.locator('#filters [data-filter="reviewing"]').click()
    assert.equal(await page.locator('#caseRows .case').count(),1)
    await page.locator('#search').fill('')
    assert.equal(await page.locator('#caseRows .case').count(),2)
    await page.locator('#caseRows .case').first().click()
    await page.goBack()
    assert.equal(await page.locator('#shade').isVisible(),false,'Back closes drawer before leaving site '+lang)
    assert.ok((await page.url()).startsWith(url),'Back may not leave site '+lang)
    await page.locator('#mobileNav [data-screen="reports"]').click()
    assert.equal(await page.locator('#screen-reports').isVisible(),true)
    const downloadPromise=page.waitForEvent('download')
    await page.locator('#csvBtn').click()
    const download=await downloadPromise
    assert.equal(download.suggestedFilename(),'FAJR-PARSA-FAKE-DEMO.csv')
    await page.locator('#resetBtn').click()
    await page.locator('#mobileNav [data-screen="home"]').click()
    assert.equal(await page.locator('#recentRows .case').count(),4)
    await page.reload()
    assert.equal(await page.locator('#recentRows .case').count(),4)
    assert.deepEqual(errors,[])
    if(lang==='fa'){
      await mkdir(new URL('../test-results/',import.meta.url),{recursive:true})
      await page.screenshot({path:new URL('../test-results/office-preview-mobile.png',import.meta.url).pathname,fullPage:true})
    }
    await context.close()
    console.log('PASS office design preview '+lang+': 4 widths, filters, local edits, Back, CSV, reset, zero API requests')
  }
}finally{
  await browser.close()
  await new Promise(resolve=>server.close(resolve))
}
