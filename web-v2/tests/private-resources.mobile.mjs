import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {once} from 'node:events'
import {mkdir} from 'node:fs/promises'
import {chromium} from 'playwright'
import {RESOURCE_HTML,RESOURCE_CSS,RESOURCE_JS} from '../../workers/fajr-office-qa/resources-ui.mjs'

test('private QA resource page: safe mobile FA/EN, denied guest, read-only owner response',async()=>{
 const API='/api/resources/providers/cloudflare/fajr-parsa-qa'
 let authMode='guest'
 const requests=[]
 const server=createServer((req,res)=>{
  requests.push({path:req.url,method:req.method,header:req.headers['x-fp-office-request']})
  if(req.url==='/resources'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(RESOURCE_HTML);return}
  if(req.url==='/resources.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8'});res.end(RESOURCE_CSS);return}
  if(req.url==='/resources.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});res.end(RESOURCE_JS);return}
  if(req.url===API){
   if(req.method!=='GET'||req.headers['x-fp-office-request']!=='same-origin'){res.writeHead(403,{'Content-Type':'application/json'});res.end('{"error":"forbidden"}');return}
   if(authMode==='guest'){res.writeHead(401,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"sign_in_required"}');return}
   const reply={id:'cloudflare-pages/fajr-parsa-qa',provider:'cloudflare_pages',name:'fajr-parsa-qa',
    url:'https://fajr-parsa-qa.pages.dev',productionBranch:'main',permission:'read-only',
    ownerVerified:true,allowedActions:['inspect'],lastVerifiedAt:'2026-11-18T00:00:00.000Z'}
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(reply));return
  }
  res.writeHead(404);res.end()
 })
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const port=server.address().port
 const base='http://127.0.0.1:'+port
 const browser=await chromium.launch({headless:true})
 const outbound=[]
 try{
  await mkdir('test-results',{recursive:true})
  for(const width of [360,393]){
   authMode='guest'
   const context=await browser.newContext({viewport:{width,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
   const page=await context.newPage()
   const errors=[]
   page.on('pageerror',e=>errors.push(String(e)))
   page.on('request',r=>{if(!r.url().startsWith(base+'/'))outbound.push(r.url())})
   await page.goto(base+'/resources',{waitUntil:'networkidle'})
   await page.getByRole('heading',{name:'مدیریت منابع متصل'}).waitFor()
   await page.getByRole('status').filter({hasText:'ابتدا وارد دفتر شوید'}).waitFor()
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
   assert.equal(await page.evaluate(()=>innerWidth),width)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow')
   assert.equal(await page.locator('#domain').innerText(),'—')
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-private-guest.png',fullPage:true})
   authMode='owner'
   await page.getByRole('button',{name:'بررسی دوبارهٔ اتصال'}).click()
   await page.getByRole('status').filter({hasText:'اتصال فقط‌خواندنی تأیید شد'}).waitFor()
   assert.equal(await page.locator('#domain').innerText(),'https://fajr-parsa-qa.pages.dev')
   assert.equal(await page.locator('#branch').innerText(),'main')
   assert.equal(await page.locator('#rights').innerText(),'فقط مشاهده')
   await page.locator('#language').selectOption('en')
   await page.getByRole('heading',{name:'Connected resources'}).waitFor()
   await page.getByRole('status').filter({hasText:'Read-only connection verified'}).waitFor()
   assert.equal(await page.locator('html').getAttribute('dir'),'ltr')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no EN overflow')
   await page.screenshot({path:'test-results/fp-admin-v2-'+width+'-private-readonly.png',fullPage:true})
   assert.deepEqual(errors,[])
   await context.close()
  }
  assert.deepEqual(outbound,[],'UI never contacts external services directly')
  assert.ok(requests.filter(x=>x.path===API).length>=4)
  assert.ok(requests.filter(x=>x.path===API).every(x=>x.method==='GET'&&x.header==='same-origin'))
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})
