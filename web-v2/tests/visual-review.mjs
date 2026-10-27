import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve('dist')
const output = resolve(process.env.QA_OUTPUT || 'test-results')
await mkdir(output, { recursive: true })
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.webp':'image/webp', '.png':'image/png' }
const server = createServer(async (req,res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'))
  if (!path.startsWith(root + sep)) { res.writeHead(403); res.end(); return }
  if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return }
  try { const bytes = await readFile(path); res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' }); res.end(bytes) }
  catch { res.writeHead(404);res.end('Not found') }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${server.address().port}/`
const launch = { headless: true }
if (process.env.QA_CHROMIUM) {
  launch.executablePath = process.env.QA_CHROMIUM
  launch.args = ['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']
}
const browser = await chromium.launch(launch)
const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'})
const page = await context.newPage()
const failures=[], results=[], external=[]
page.on('pageerror', e => failures.push(e.message))
page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:')) external.push(r.url()) })
async function test(name, fn) { try { await fn();results.push({name,status:'PASS'}) } catch(e) { results.push({name,status:'FAIL',error:e.message}); throw e } }
try {
 await page.goto(url,{waitUntil:'networkidle'});
 for (const width of [1440,393]) {
  await page.setViewportSize({width,height:width===1440?1000:852});
  const theme=width===1440?'light':'dark';const current=await page.locator('html').getAttribute('data-theme');if(current!==theme){await page.getByRole('button',{name:theme==='light'?'فعال کردن حالت روشن':'فعال کردن حالت تاریک',exact:true}).click();await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)}
  for (const selector of ['.hero','#finder','#services','#destinations','#journey','#track','#faq','footer']) {
   await page.locator(selector).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
   await page.waitForTimeout(650);
   await page.screenshot({path:resolve(output,`after-${width}-${selector.replace(/[^a-z]/g,'')}.png`)});
  }
 }
} finally { await browser.close();await new Promise(r=>server.close(r)) }
