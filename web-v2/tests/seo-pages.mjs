import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

// Exercise Pages routing, not Vite's fallback or the smoke suite's Node server.
const origin = 'http://127.0.0.1:8788'
const output = 'test-results'
await mkdir(output,{recursive:true})
const server = spawn('npx',['--yes','wrangler@4.76.0','pages','dev','dist','--ip','127.0.0.1','--port','8788','--compatibility-date','2026-11-05'], {
  detached:true, env:{...process.env,WRANGLER_SEND_METRICS:'false'}, stdio:['ignore','pipe','pipe'],
})
let logs=''
server.stdout.on('data',chunk=>logs+=chunk)
server.stderr.on('data',chunk=>logs+=chunk)
const results=[], errors=[], external=[], assetErrors=[]
let browser
async function test(name,fn) {
  try { await fn(); results.push({name,status:'PASS'}) }
  catch(error) {results.push({name,status:'FAIL',error:error.message});throw error}
}
try {
  const deadline=Date.now()+60000
  while(true) {
    try {if((await fetch(origin)).ok)break} catch {}
    if(server.exitCode!==null || Date.now()>deadline)throw new Error('Local Pages did not start: '+logs)
    await new Promise(resolve=>setTimeout(resolve,200))
  }
  await test('Pages serves meaningful HTML and one canonical before JavaScript',async()=>{
    const response=await fetch(origin+'/inbound')
    assert.equal(response.status,200)
    assert.match(response.headers.get('content-type'),/text\/html/)
    const html=await response.text()
    await writeFile(output+'/inbound-response.html',html)
    assert.match(html,/<html lang="en" dir="ltr">/)
    for(const text of ['Discover Afghanistan.','Airport pickup','Private transportation','Hotel reservations','Interpreter &amp; guide coordination','Tailored journeys','How we work','No booking is made'])assert.ok(html.includes(text),text)
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1)
    assert.equal((html.match(/<title>/g)||[]).length,1)
    assert.equal((html.match(/name="description"/g)||[]).length,1)
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1)
    assert.match(html,/rel="canonical" href="https:\/\/fajr-parsa-qa.pages.dev\/inbound"/)
    assert.match(html,/property="og:url" content="https:\/\/fajr-parsa-qa.pages.dev\/inbound"/)
    assert.doesNotMatch(html,/noindex|hreflang|application\/ld\+json/)
  })
  await test('Pages aliases converge without a redirect loop',async()=>{
    for(const path of ['/inbound/','/inbound.html']) {
      const response=await fetch(origin+path)
      assert.equal(response.status,200)
      assert.equal(new URL(response.url).pathname,'/inbound')
      assert.match(await response.text(),/Discover Afghanistan/)
    }
  })
  const launch={headless:true,executablePath:process.env.QA_CHROMIUM,
    ...(process.env.QA_CHROMIUM ? {args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']} : {})}
  browser=await chromium.launch(launch)
  const nojs=await browser.newContext({javaScriptEnabled:false})
  await test('No-JS visitor sees five services and cannot submit the static form',async()=>{
    const page=await nojs.newPage()
    await page.goto(origin+'/inbound')
    await page.getByRole('heading',{name:/Discover Afghanistan/}).waitFor()
    assert.equal(await page.locator('.inbound-service').count(),5)
    assert.equal(await page.locator('.inbound-form').getAttribute('inert'),'')
    assert.equal(await page.getByRole('button',{name:/Continue to WhatsApp/}).isDisabled(),true)
    assert.match(await page.locator('noscript').last().innerText(),/Enable JavaScript/)
    await page.locator('.inbound-bottom a').first().click()
    assert.equal(new URL(page.url()).pathname,'/')
  })
  await browser.close()
  browser=await chromium.launch(launch)
  const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'})
  // Block outbound traffic even if a regression accidentally introduces a request.
  await context.route('**/*',route=>{
    const url=route.request().url()
    if(url.startsWith(origin+'/')||url.startsWith('data:'))return route.continue()
    external.push(url);return route.abort()
  })
  context.on('page',page=>{
    page.on('pageerror',error=>errors.push(error.message))
    page.on('response',response=>{if(response.status()>=400)assetErrors.push({url:response.url(),status:response.status()})})
  })
  const page=await context.newPage()
  await test('Direct entry, reload, languages and metadata agree',async()=>{
    await page.goto(origin+'/inbound',{waitUntil:'networkidle'})
    await page.locator('.inbound-form:not([inert])').waitFor()
    for(const [label,lang,dir,title] of [['دری','fa-AF','rtl','گردشگری ورودی افغانستان'],['العربية','ar','rtl','السياحة الوافدة'],['English','en','ltr','Afghanistan Inbound Tourism']]) {
      await page.locator('.fp-lang-trigger').click()
      await page.locator('.fp-lang-panel').getByRole('button',{name:label,exact:true}).click()
      await page.waitForFunction(({lang,dir})=>document.documentElement.lang===lang&&document.documentElement.dir===dir,{lang,dir})
      assert.ok((await page.title()).includes(title))
      assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'),await page.title())
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://fajr-parsa-qa.pages.dev/inbound')
      for(const width of [320,360,393,768,1440]) {
        await page.setViewportSize({width,height:852})
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${label} at ${width}`)
      }
      await page.setViewportSize({width:393,height:852})
      await page.screenshot({path:`${output}/inbound-seo-${lang}-phone.png`,fullPage:true})
    }
    await page.reload({waitUntil:'networkidle'})
    assert.equal(await page.locator('.inbound h1').count(),1)
    assert.equal(await page.locator('.inbound-service').count(),5)
    assert.equal(await page.locator('html').getAttribute('lang'),'en')
  })
  await test('Canonical form still blocks invalid contact and only prepares a consented WhatsApp draft',async()=>{
    await page.evaluate(()=>{window.open=target=>{window.__seoWhatsApp=target;return null}})
    await page.getByRole('textbox',{name:'Your name',exact:true}).fill('Synthetic Visitor')
    await page.getByRole('textbox',{name:'Email or contact number',exact:true}).fill('invalid')
    await page.locator('input[type="date"]').fill('2099-01-01')
    await page.locator('.inbound-consent input').check()
    const submit=page.getByRole('button',{name:/Continue to WhatsApp/})
    await submit.click()
    assert.equal(await page.evaluate(()=>window.__seoWhatsApp??null),null)
    await page.getByRole('textbox',{name:'Email or contact number',exact:true}).fill('visitor@example.invalid')
    await page.locator('.inbound-consent input').uncheck();await submit.click()
    assert.equal(await page.evaluate(()=>window.__seoWhatsApp??null),null)
    await page.locator('.inbound-consent input').check();await submit.click()
    const link=new URL(await page.evaluate(()=>window.__seoWhatsApp))
    assert.equal(link.origin,'https://wa.me');assert.equal(link.pathname,'/93777377774')
    assert.match(link.searchParams.get('text'),/Synthetic Visitor/)
    assert.equal(await page.locator('input[type="date"]').getAttribute('min'),await page.evaluate(()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${values.year}-${values.month}-${values.day}`}))
  })
  await test('One global language control, native labels and shareable language state',async()=>{
    await page.goto(origin+'/',{waitUntil:'networkidle'})
    const trigger=page.locator('.fp-lang-trigger')
    assert.equal(await trigger.isVisible(),true)
    assert.equal(await trigger.evaluate(el=>el.getBoundingClientRect().height>=44),true)
    await trigger.click()
    const panel=page.locator('.fp-lang-panel')
    assert.equal(await panel.getByRole('link',{name:'دری',exact:true}).getAttribute('href'),'/inbound?lang=fa')
    assert.equal(await panel.getByRole('link',{name:'English',exact:true}).getAttribute('href'),'/inbound?lang=en')
    await panel.getByRole('link',{name:'العربية',exact:true}).click()
    // Pages serves prerendered English HTML before React enhances the localized route.
    await page.locator('.inbound-form:not([inert])').waitFor()
    await page.waitForFunction(()=>document.documentElement.lang==='ar')
    assert.equal(new URL(page.url()).pathname,'/inbound')
    assert.equal(new URL(page.url()).searchParams.get('lang'),'ar')
    assert.equal(await page.locator('html').getAttribute('lang'),'ar')
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
    assert.match(await page.locator('.inbound h1').innerText(),/أفغانستان/)
    await page.reload({waitUntil:'networkidle'})
    assert.equal(await page.locator('html').getAttribute('lang'),'ar')
    await page.locator('.fp-lang-trigger').click()
    const selector=page.locator('.fp-lang-panel')
    assert.equal(await selector.getByRole('button',{name:'العربية',exact:true}).getAttribute('aria-pressed'),'true')
    await selector.getByRole('button',{name:'دری',exact:true}).click()
    assert.equal(new URL(page.url()).searchParams.get('lang'),'fa')
    assert.equal(await page.locator('html').getAttribute('lang'),'fa-AF')
    await page.reload({waitUntil:'networkidle'})
    assert.equal(await page.locator('html').getAttribute('lang'),'fa-AF')
    await page.locator('.fp-lang-trigger').click()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.fp-lang-panel').count(),0)
    await page.goto(origin+'/',{waitUntil:'networkidle'})
    assert.equal(await page.locator('html').getAttribute('lang'),'fa-AF')
    assert.equal(await page.locator('.fp-lang-trigger').isVisible(),true)
  })
  await test('Legacy replacement, home links, section anchors and browser history survive',async()=>{
    await page.goto(origin+'/#/inbound?not-a-route')
    assert.equal(await page.locator('.inbound').count(),0)
    await page.goto(origin+'/?source=legacy#/inbound',{waitUntil:'networkidle'})
    assert.equal(page.url(),origin+'/inbound?source=legacy')
    await page.getByRole('button',{name:'Mobile menu',exact:true}).click()
    await page.locator('#mobile-navigation').getByRole('link',{name:'Services',exact:true}).click()
    assert.ok(await page.locator('#inbound-services').evaluate(el=>el.getBoundingClientRect().top<innerHeight))
    await page.locator('.inbound-bottom a').first().click()
    await page.locator('.hero-scene').waitFor()
    assert.equal(new URL(page.url()).pathname,'/')
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
    assert.equal(await page.locator('link[rel="canonical"]').count(),0)
    assert.equal(await page.locator('meta[property="og:title"]').count(),0)
    await page.getByRole('link',{name:'Visit Afghanistan',exact:true}).click()
    await page.locator('.inbound-form:not([inert])').waitFor()
    assert.equal(new URL(page.url()).pathname,'/inbound')
    await page.goBack();await page.locator('.hero-scene').waitFor()
    await page.goForward();await page.locator('.inbound h1').waitFor()
    // A legacy hash changes routes inside the same React instance as well.
    await page.goto(origin+'/',{waitUntil:'networkidle'})
    await page.evaluate(()=>window.location.hash='/inbound')
    await page.locator('.inbound-form:not([inert])').waitFor()
    await page.locator('.fp-lang-trigger').click();await page.locator('.fp-lang-panel').getByRole('button',{name:'دری',exact:true}).click()
    await page.goBack();await page.locator('.hero-scene').waitFor()
    await page.goForward();await page.locator('.inbound h1').waitFor()
    assert.equal(await page.locator('.inbound').getAttribute('lang'),await page.locator('html').getAttribute('lang'))
    assert.match(await page.locator('.floating-header nav').first().innerText(),/روش کار/)
    assert.match(await page.title(),/گردشگری ورودی افغانستان/)
    await page.goto(origin+'/#country-services')
    await page.getByRole('button',{name:'خدمات ایران',exact:true}).click()
    await page.getByRole('heading',{name:'خدمات سفر به ایران',exact:true}).waitFor()
    await page.reload();await page.getByRole('heading',{name:'خدمات سفر به ایران',exact:true}).waitFor()
    await page.goto(origin+'/inbound-other',{waitUntil:'networkidle'})
    assert.equal(await page.locator('.inbound').count(),0)
  })
  await test('No duplicate page, browser errors, bad assets or outbound application requests',async()=>{
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(assetErrors,[])
  })
} finally {
  await browser?.close()
  try {process.kill(-server.pid,'SIGTERM')}catch {}
  await writeFile(output+'/inbound-pages.log',logs)
  const report={scope:'Local Wrangler Pages emulation only; no deploy or live message',results,errors,external,assetErrors}
  await writeFile(output+'/inbound-seo-results.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify(report,null,2))
}
