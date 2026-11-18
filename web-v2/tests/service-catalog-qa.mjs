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
  assert.equal(await section.locator('#fp-guide-destination option').count(),17)
  assert.equal(await section.getByText(unavailable[lang],{exact:true}).count(),1)
  const disclosure=section.locator('.fp-guide-disclosure')
  assert.equal(await disclosure.count(),1)
  assert.equal(await disclosure.getAttribute('open'),null,'Long requirements must be collapsed initially')
  assert.equal(await disclosure.locator('.fp-guide-facts').isVisible(),false,'Long details hidden until requested')
  const compactHeight=await section.locator('.fp-guide-detail').evaluate(e=>e.getBoundingClientRect().height)
  await disclosure.locator('summary').click()
  assert.equal(await disclosure.getAttribute('open'),'','Details open without a new page')
  assert.equal(await disclosure.locator('.fp-guide-facts section').count(),4,'No important information removed')
  assert.equal(await disclosure.locator('.fp-guide-facts').isVisible(),true)
  const expandedHeight=await section.locator('.fp-guide-detail').evaluate(e=>e.getBoundingClientRect().height)
  assert.ok(expandedHeight>compactHeight+100,'Compact view must save visible vertical space')
  await disclosure.locator('summary').focus()
  await page.keyboard.press('Enter')
  assert.equal(await disclosure.getAttribute('open'),null,'Disclosure can close using keyboard')
  assert.equal(await section.locator('.fp-guide-review.is-approved').count(),0,'unverified services must never claim approved')
  assert.equal(await page.locator('.service-card').first().locator('a[href="#service-guide"]').innerText(),titles[lang])
  for(const width of [320,360,393,768,1280]){
   await page.setViewportSize({width,height:852})
   const result=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth,guide:document.querySelector('#service-guide')?.getBoundingClientRect().width}))
   assert.ok(result.scroll<=width+1,'Horizontal overflow '+lang+' '+width+': '+JSON.stringify(result))
   const targets=await section.locator('.fp-guide-category, .fp-guide-primary, .fp-guide-disclosure summary, #fp-guide-destination').evaluateAll(els=>els.map(el=>({h:Math.round(el.getBoundingClientRect().height),tag:el.tagName})))
   assert.ok(targets.every(x=>x.h>=44),'Touch targets shorter than 44px '+lang+' '+width+': '+JSON.stringify(targets))
  }
  await page.setViewportSize({width:393,height:852})
  const cardLinks=await page.locator('.service-card').first().locator('a[href="#service-guide"], button').evaluateAll(els=>els.map(el=>Math.round(el.getBoundingClientRect().height)))
  assert.ok(cardLinks.every(h=>h>=44),'Existing service card actions must be easy to tap')
  await section.locator('.fp-guide-category').nth(1).click()
  assert.equal(await section.locator('.fp-guide-category[aria-pressed="true"]').count(),1)
  await section.locator('.fp-guide-category').first().click()
  await section.locator('#fp-guide-destination').selectOption('امارات')
  await section.locator('.fp-guide-primary').click()
  const dialog=page.getByRole('dialog')
  await dialog.waitFor()
  assert.equal(await dialog.locator('#draft-service').inputValue(),'ویزا و اقامت')
  assert.equal(await dialog.locator('#draft-destination').inputValue(),lang==='en'?'UAE':lang==='ar'?'الإمارات':'امارات')
  const expectedToday=await page.evaluate(()=>{
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
    const values=Object.fromEntries(parts.map(p=>[p.type,p.value]))
    return values.year+'-'+values.month+'-'+values.day
  })
  const draftDate=dialog.locator('#draft-date')
  assert.equal(await draftDate.getAttribute('min'),expectedToday,'Draft date follows Kabul local day')
  await draftDate.fill('2020-01-01')
  assert.equal(await draftDate.evaluate(el=>el.validity.rangeUnderflow),true,'A past travel date is invalid')
  await dialog.locator('button[type="submit"]').click()
  assert.equal(await dialog.locator('.request-summary').count(),0,'Invalid past date must not advance to review')
  await draftDate.fill(expectedToday)
  await dialog.locator('button[type="submit"]').click()
  await dialog.locator('.request-summary').waitFor({state:'visible'})
  const emailLink=dialog.locator('.request-summary a[href^="mailto:"]')
  assert.equal(await emailLink.count(),1,'Reviewed service request must have a real email channel')
  const emailHref=await emailLink.getAttribute('href')
  assert.ok(emailHref.startsWith('mailto:fp.rpc.khwaja@gmail.com?'),'Real connected business mailbox')
  const bodyText=new URL(emailHref).searchParams.get('body')||''
  assert.ok(bodyText.includes(expectedToday),'Email includes the selected travel date')
  assert.ok(bodyText.includes(lang==='en'?'UAE':lang==='ar'?'الإمارات':'امارات'),'Email includes localized destination')
  assert.ok(bodyText.includes(lang==='en'?'Visa':lang==='ar'?'تأش':lang==='ps'?'ویزه':'ویزا')||bodyText.includes('ویزا و اقامت'),'Email includes service type')
  assert.equal(await dialog.locator('.request-summary a[href^="https://wa.me/"]').count(),1,'WhatsApp remains usable')

  await page.keyboard.press('Escape')
  await dialog.waitFor({state:'detached'})
  await page.locator('nav.mobile-action-bar button[aria-controls="fp-contact-dialog"]').click()
  const contact=page.getByRole('dialog')
  await contact.waitFor({state:'visible'})
  assert.equal(await contact.locator('.fp-contact-channels a').count(),2,'Only functional contact options are shown')
  assert.equal(await contact.locator('.fp-channel-pending').count(),0,'No nonfunctional Telegram/AI placeholders')
  assert.ok((await contact.locator('.fp-contact-channels a[href^="mailto:"]').getAttribute('href')).includes('fp.rpc.khwaja@gmail.com'))
  assert.equal(await contact.locator('.fp-contact-channels a[href^="https://wa.me/"]').count(),1)
  await page.keyboard.press('Escape')
  await contact.waitFor({state:'detached'})
  assert.deepEqual(errors,[],'No runtime exceptions '+lang)
  await context.close()
  console.log('PASS FP-07/09 '+lang+': compact catalog, real email/WhatsApp channels, email enquiry body, keyboard disclosure, safe touch controls, 6 services/16 destinations')
 }
}finally{
 await browser.close()
 await new Promise(resolve=>server.close(resolve))
}

// TEMPORARY QA asset capture for one-time local vendoring; remove after committing the licensed photograph.
const omanRemote='https://images.pexels.com/photos/30799019/pexels-photo-30799019.jpeg?auto=compress&cs=tinysrgb&w=960&h=640&fit=crop&fm=webp&q=74'
const omanResult=await fetch(omanRemote,{signal:AbortSignal.timeout(20000)})
assert.ok(omanResult.ok,'Official Pexels image endpoint unavailable: '+omanResult.status)
const omanBytes=Buffer.from(await omanResult.arrayBuffer())
assert.ok(omanBytes.length>9000 && omanBytes.length<1000000,'Invalid public photo byte count')
assert.equal(omanBytes.toString('ascii',0,4),'RIFF','Image is not a WebP file')
const omanB64=omanBytes.toString('base64')
const chunks=omanB64.match(/.{1,4000}/g)||[]
for(let i=0;i<chunks.length;i++)console.log('FP_OMAN_IMG_PART_'+String(i).padStart(3,'0')+'='+chunks[i])
const {createHash}=await import('node:crypto')
console.log('FP_OMAN_IMG_FINISH sha256='+createHash('sha256').update(omanBytes).digest('hex')+' count='+chunks.length+' size='+omanBytes.length)
