import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const base='https://fajr-office-qa.khoojafahim.workers.dev/'
const config='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config'
const browser=await chromium.launch({headless:true})
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:840},locale:'fa-AF',reducedMotion:'reduce'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000})
  await page.locator('#login-form').waitFor()
  assert.equal(await page.locator('h1').textContent(),'دفتر مدیریت درخواست‌ها')
  assert.equal(await page.locator('#office-view').isVisible(),false)
  const cfg=await page.evaluate(async url=>{
   const response=await fetch(url,{cache:'no-store'})
   const json=await response.json()
   return {status:response.status,keyValid:typeof json.publishableKey==='string'&&json.publishableKey.length>20}
  },config)
  assert.deepEqual(cfg,{status:200,keyValid:true},'CORS/browser config unavailable')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow')
  await page.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'synthetic_invalid_credentials'})}))
  await page.locator('#email').fill('qa@example.invalid')
  await page.locator('#password').fill('synthetic-do-not-send')
  await page.locator('#login-button').click()
  await page.getByRole('alert').first().waitFor()
  assert.match(await page.locator('#login-alert').textContent(),/ایمیل یا رمز صحیح نیست/)
  assert.equal(await page.locator('#office-view').isVisible(),false)
  assert.deepEqual(errors,[])
  await context.close()
 }
 console.log('PASS: public office loads at 390/1280, browser CORS config works, invalid login intercepted, private workspace stays closed')
}finally{await browser.close()}
