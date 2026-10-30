import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const html = await readFile(resolve('office-preview.html'),'utf8')
assert.match(html,/محیط کاملاً ساختگی و آفلاین/)
const browser=await chromium.launch({headless:true})
try {
 for (const width of [320,390,768,1280]) {
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'})
  const page=await context.newPage()
  const network=[],errors=[]
  page.on('request',req=>network.push(req.url()))
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('file://'+resolve('office-preview.html'))
  await page.waitForSelector('#cases article')
  assert.equal(await page.locator('#cases article').count(),3)
  assert.equal(await page.locator('#total').textContent(),'3')
  assert.equal(await page.locator('#pending').textContent(),'3')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow at '+width)
  assert.deepEqual(network.filter(url=>!url.startsWith('file:')),[])
  assert.deepEqual(errors,[])
  if(width===390){
   const item=page.locator('#cases article').first()
   await item.locator('select').selectOption('reviewing')
   await item.getByRole('button',{name:'مرور تغییر'}).click()
   assert.equal(await page.locator('dialog').evaluate(e=>e.open),true)
   await page.getByRole('button',{name:'انصراف'}).click()
   assert.match(await item.locator('.muted').textContent(),/دریافت‌شده/)
   await item.locator('select').selectOption('reviewing')
   await item.getByRole('button',{name:'مرور تغییر'}).click()
   await page.getByRole('button',{name:'تأیید تغییر آزمایشی'}).click()
   assert.match(await page.locator('#cases article').first().locator('.muted').textContent(),/در حال بررسی/)
   await page.reload()
   assert.match(await page.locator('#cases article').first().locator('.muted').textContent(),/دریافت‌شده/)
   assert.deepEqual(network.filter(url=>!url.startsWith('file:')),[])
  }
  await context.close()
 }
 console.log('PASS: 320/390/768/1280, dialog cancel/confirm/reload, no external traffic or JavaScript errors')
}finally{await browser.close()}
