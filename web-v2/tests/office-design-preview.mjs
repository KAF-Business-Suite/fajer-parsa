import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const base='https://fajr-office-qa.khoojafahim.workers.dev'
const root=base+'/'
const preview=base+'/design-preview'
const browser=await chromium.launch({headless:true})
try{
 const original=await fetch(root)
 assert.equal(original.status,200)
 assert.match(await original.text(),/دفتر مدیریت درخواست‌ها/, 'existing operational login must remain unchanged')
 for(const width of [360,390,1280]){
  const context=await browser.newContext({viewport:{width,height:850},locale:'fa-AF',reducedMotion:'reduce'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',err=>errors.push(err.message))
  await page.goto(preview,{waitUntil:'domcontentloaded',timeout:20000})
  await page.locator('#login-form').waitFor()
  assert.match(await page.locator('h1').textContent(),/دفتر فجرپارسا/)
  assert.match(await page.locator('.pilot-ribbon').textContent(),/تغییر پرونده‌ها.*غیرفعال/)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal scrolling allowed')
  const cssResponse=await page.request.get(base+'/design-preview/app.css')
  assert.equal(cssResponse.status(),200,'pilot CSS endpoint must work')
  const cssText=await cssResponse.text()
  assert.match(cssText,/body\.fp-design-pilot/,'pilot CSS must include body scope')
  await page.waitForFunction(()=>getComputedStyle(document.body).fontFamily.includes('Vazirmatn'),null,{timeout:6000}).catch(async error=>{
   console.log('STYLE_DIAGNOSTIC',JSON.stringify({width,bodyClass:await page.locator('body').getAttribute('class'),font:await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily),cssBytes:cssText.length,headLinks:await page.locator('head link').evaluateAll(nodes=>nodes.map(n=>n.href))}))
   throw error
  })
  assert.equal(await page.locator('#office-view').isVisible(),false)
  let resolveLogin
  await page.route('**/auth/v1/token?grant_type=password',async route=>{
   await new Promise(resolve=>{resolveLogin=resolve})
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    access_token:'synthetic-preview-access',refresh_token:'synthetic-preview-refresh'
   })})
  })
  let writes=0,reads=0
  await page.route('**/functions/v1/fajr-office/api/office**',async route=>{
   if(route.request().method()!=='GET'){writes++;return route.fulfill({status:403,body:'forbidden'})}
   reads++
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{
    id:'00000000-0000-4000-8000-000000000011',service:'آزمایشی',
    destination:'QA synthetic',variant:'',contact:'qa@example.invalid',status:'received',
    created_at:'2026-10-31T00:00:00Z'
   }])})
  })
  await page.locator('#email').fill('qa@example.invalid')
  await page.locator('#password').fill('test-not-real')
  await page.locator('#login-button').click()
  await page.locator('#login-button.is-loading').waitFor({state:'visible'})
  assert.equal(await page.locator('#login-button').getAttribute('aria-busy'),'true')
  assert.match(await page.locator('#login-button').textContent(),/در حال بررسی/)
  assert.equal(await page.locator('#login-button').isDisabled(),true)
  resolveLogin()
  await page.locator('#office-view').waitFor({state:'visible'})
  await page.locator('.case').first().waitFor()
  assert.equal(await page.locator('.case select').isDisabled(),true)
  assert.equal(await page.locator('#total').textContent(),'1')
  assert.equal(writes,0)
  assert.ok(reads>=1)
  assert.deepEqual(errors,[])
  await context.close()
 }
 console.log('PASS: isolated design preview, responsive 360/390/1280, login loading, read-only office, original unchanged')
}finally{await browser.close()}
