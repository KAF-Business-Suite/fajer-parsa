import { strict as assert } from 'node:assert'
import { createServer } from 'node:http'
import { existsSync, createReadStream, readFileSync } from 'node:fs'
import { resolve, extname, join, normalize } from 'node:path'
import { chromium } from 'playwright'

// FP-07: compile first, then verify the REAL app (not an isolated mock).
const dist=resolve('dist')
assert.ok(existsSync(join(dist,'index.html')),'Run npm run build before this test')
const source=readFileSync(resolve('src/content/service-catalog.ts'),'utf8')
assert.ok(source.includes('approved_for_enquiry')&&source.includes('needs_confirmation'))
assert.ok(source.includes('proof: null')&&source.includes('price: null')&&source.includes('duration: null'))
const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'}
const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost')
  const candidate=normalize(join(dist,decodeURIComponent(url.pathname)))
  if(!candidate.startsWith(dist)){res.writeHead(403);res.end();return}
  const file=existsSync(candidate)&&!candidate.endsWith('/')?candidate:join(dist,'index.html')
  if(!existsSync(file)){res.writeHead(404);res.end();return}
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'})
  createReadStream(file).pipe(res)
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const origin='http://127.0.0.1:'+server.address().port
const browser=await chromium.launch({headless:true})
const titles={fa:'شرایط و جزئیات',ps:'شرایط او جزییات',en:'Conditions & details',ar:'الشروط والتفاصيل'}
const unavailable={fa:'نیازمند بررسی دفتر',ps:'د دفتر تایید ته اړتیا',en:'Office confirmation required',ar:'تتطلب تأكيد المكتب'}
try{
 for(const lang of ['fa','ps','en','ar']){
  const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce',locale:lang==='en'?'en-US':'fa-AF'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto(origin+'/?lang='+lang,{waitUntil:'networkidle'})
  assert.equal(await page.locator('html').getAttribute('dir'),lang==='en'?'ltr':'rtl')
  assert.equal(await page.locator('.service-card').count(),6,'existing service cards remain available')
  await page.locator('.service-card').first().locator('a[href="#service-guide"]').click()
  const section=page.locator('#service-guide')
  await section.waitFor({state:'visible'})
  assert.equal(await section.locator('.fp-guide-category').count(),6)
  assert.equal(await section.locator('#fp-guide-destination option').count(),16)
  assert.equal(await section.getByText(unavailable[lang],{exact:true}).count(),1)
  assert.equal(await section.locator('.fp-guide-review.is-approved').count(),0,'unverified services must never claim approved')
  assert.equal(await page.locator('.service-card').first().locator('a[href="#service-guide"]').innerText(),titles[lang])
  for(const width of [320,360,393,768,1280]){
   await page.setViewportSize({width,height:852})
   const result=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth,guide:document.querySelector('#service-guide')?.getBoundingClientRect().width}))
   assert.ok(result.scroll<=width+1,'Horizontal overflow '+lang+' '+width+': '+JSON.stringify(result))
  }
  await page.setViewportSize({width:393,height:852})
  await section.locator('.fp-guide-category').nth(1).click()
  assert.equal(await section.locator('.fp-guide-category[aria-pressed="true"]').count(),1)
  await section.locator('.fp-guide-category').first().click()
  await section.locator('#fp-guide-destination').selectOption('امارات')
  await section.locator('.fp-guide-primary').click()
  const dialog=page.getByRole('dialog')
  await dialog.waitFor()
  assert.equal(await dialog.locator('#draft-service').inputValue(),'ویزا و اقامت')
  assert.equal(await dialog.locator('#draft-destination').inputValue(),lang==='en'?'UAE':lang==='ar'?'الإمارات':'امارات')
  await page.keyboard.press('Escape')
  await dialog.waitFor({state:'detached'})
  assert.deepEqual(errors,[],'No runtime exceptions '+lang)
  await context.close()
  console.log('PASS FP-07 '+lang+': 6 catalog groups, 15 destination choices, no invented offers, four viewports, real request context')
 }
}finally{
 await browser.close()
 await new Promise(resolve=>server.close(resolve))
}
