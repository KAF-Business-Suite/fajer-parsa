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
  await page.goto(url,{waitUntil:'networkidle'})
  await test('RTL and light default', async()=>{assert.equal(await page.locator('html').getAttribute('dir'),'rtl');assert.equal(await page.locator('html').getAttribute('data-theme'),'light')})
  await page.screenshot({path:resolve(output,'desktop-light-initial.png')});await page.getByRole('button',{name:'فعال کردن حالت تاریک',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await page.screenshot({path:resolve(output,'desktop-dark.png')})
  await test('Light theme and reload persistence', async()=>{await page.getByRole('button',{name:'فعال کردن حالت روشن',exact:true}).click();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light')})
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:resolve(output,'desktop-light.png')})
  await test('Finder validation, details, Escape and focus restoration', async()=>{
    const button=page.getByRole('button',{name:'نمایش خدمات مرتبط',exact:true});assert.equal(await button.isEnabled(),false)
    await page.getByLabel('مقصد',{exact:true}).selectOption({label:'ایران'});await page.getByLabel('هدف سفر',{exact:true}).selectOption({label:'سیاحت'})
    await button.click();assert.match(await page.getByRole('dialog').innerText(),/ایران/);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);await page.waitForFunction(()=>document.activeElement?.textContent?.includes('نمایش خدمات مرتبط'))
  })
  await test('Live catalog search and empty state',async()=>{
    const input=page.getByRole('searchbox',{name:'جستجوی خدمات',exact:true});await input.fill('اسناد');assert.ok(await page.locator('.service-card').count()>=1);await input.fill('zzzz-no-service');assert.equal(await page.locator('.service-card').count(),0);assert.equal(await page.getByText('خدمتی با این عبارت پیدا نشد. عبارت کوتاه‌تری بنویسید.').isVisible(),true);await input.fill('');assert.equal(await page.locator('.service-card').count(),6)
  })
  await test('Service details and focus trap',async()=>{
    await page.getByRole('button',{name:'بررسی گزینه‌ها',exact:true}).first().click();assert.match(await page.getByRole('dialog').innerText(),/ویزا/);await page.keyboard.press('Tab');assert.equal(await page.getByRole('dialog').evaluate(e=>e.contains(document.activeElement)),true);await page.keyboard.press('Escape')
  })
  await test('Destination details and local images',async()=>{
    await page.getByRole('button',{name:'خدمات این مقصد',exact:true}).nth(1).click();assert.match(await page.getByRole('dialog').innerText(),/ایران/);await page.keyboard.press('Escape');await page.locator('#destinations').scrollIntoViewIfNeeded();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.destination-card img')).every(e=>e.complete && e.naturalWidth>0));assert.equal(await page.locator('.destination-card img').count(),7)
  })
  await page.screenshot({path:resolve(output,'destinations-light.png')})
  await test('Local draft download, no submitted request',async()=>{
    await page.getByRole('button',{name:'شروع درخواست',exact:true}).first().click();await page.getByRole('dialog').getByLabel('خدمت مورد نظر',{exact:true}).selectOption({label:'ویزا و اقامت'});await page.getByRole('dialog').getByLabel('مقصد',{exact:true}).fill('ایران');const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'دریافت پیش‌نویس',exact:true}).click();const download=await downloading;const json=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(json.status,'not-submitted');assert.equal(json.destination,'ایران');await page.keyboard.press('Escape')
  })
  await test('Desktop menu Escape',async()=>{await page.evaluate(()=>window.scrollTo(0,0));await page.getByRole('button',{name:'خدمات',exact:true}).click();assert.equal(await page.locator('#services-mega').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#services-mega').count(),0)})
  for(const width of [320,360,393,768,1440]) await test(`No horizontal overflow at ${width}`,async()=>{await page.setViewportSize({width,height:852});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.locator('h1').evaluate(e=>e.getBoundingClientRect().width<=innerWidth),true)})
  await page.setViewportSize({width:393,height:852});await page.evaluate(()=>window.scrollTo(0,0))
  await test('Mobile navigation link closes menu',async()=>{await page.getByRole('button',{name:'منوی موبایل',exact:true}).click();assert.equal(await page.locator('#mobile-navigation').isVisible(),true);await page.locator('#mobile-navigation').getByRole('link',{name:'کشورها',exact:true}).click();assert.equal(await page.locator('#mobile-navigation').count(),0);assert.match(page.url(),/#destinations$/)})
  await page.goto(url,{waitUntil:'networkidle'});await page.screenshot({path:resolve(output,'mobile-light.png')})
  await test('Dark toggle applies readable foreground',async()=>{await page.getByRole('button',{name:'فعال کردن حالت تاریک',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');const color=await page.locator('header a').first().evaluate(e=>getComputedStyle(e).color);assert.notEqual(color,'rgb(24, 33, 42)')});await page.screenshot({path:resolve(output,'mobile-dark.png')})
  await test('Reduced motion retains service content',async()=>{await page.locator('#services').scrollIntoViewIfNeeded();assert.equal(await page.getByRole('button',{name:'بررسی گزینه‌ها',exact:true}).first().isVisible(),true)})
  await test('Normal motion: ready-made pointer interaction',async()=>{
    await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(url,{waitUntil:'networkidle'});await page.locator('#services').scrollIntoViewIfNeeded();
    const card=page.locator('.service-card').first();await card.hover();const before=await card.getAttribute('style');const rect=await card.boundingBox();await page.mouse.move(rect.x+24,rect.y+24);await page.waitForFunction((before)=>document.querySelector('.service-card').getAttribute('style')!==before,before)
  })
  await test('Detached rounded header remains sticky',async()=>{
    await page.setViewportSize({width:1440,height:1000});await page.goto(url,{waitUntil:'networkidle'});
    const header=page.locator('.floating-header');let rect=await header.boundingBox();assert.ok(rect.x>=20);assert.ok(rect.width<1440);assert.ok(parseFloat(await header.evaluate(e=>getComputedStyle(e).borderTopRightRadius))>=20);
    await page.evaluate(()=>window.scrollTo(0,700));await page.waitForFunction(()=>Math.abs(document.querySelector('.floating-header').getBoundingClientRect().top-14)<1);
  })
  await test('Floating menu outside click and Escape restore focus',async()=>{
    await page.setViewportSize({width:393,height:852});await page.goto(url,{waitUntil:'networkidle'});const toggle=page.getByRole('button',{name:'منوی موبایل',exact:true});
    await toggle.click();const header=await page.locator('.floating-header').boundingBox();const menu=await page.locator('#mobile-navigation').boundingBox();assert.ok(menu.y>header.y+header.height+4);
    await page.mouse.click(5,600);assert.equal(await page.locator('#mobile-navigation').count(),0);
    await toggle.click();await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true)
  })
  await page.goto(url,{waitUntil:'networkidle'});await page.screenshot({path:resolve(output,'mobile-dark-header.png')});await page.getByRole('button',{name:'منوی موبایل',exact:true}).click();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#mobile-navigation')).opacity==='1' && getComputedStyle(document.querySelector('.fp-menu-close')).opacity==='1');await page.screenshot({path:resolve(output,'mobile-menu-header.png')});await page.keyboard.press('Escape')
  await test('Reference capsule geometry and bright local hero',async()=>{
    const header=page.locator('.floating-header');const rect=await header.boundingBox();const radius=await header.evaluate(e=>parseFloat(getComputedStyle(e).borderTopRightRadius));assert.ok(radius>=rect.height/2);assert.equal(await page.locator('.hero-scene img').getAttribute('src'),'/media/hero-dubai.webp');assert.equal(await page.locator('.hero').evaluate(e=>getComputedStyle(e).backgroundImage),'none')
  })
  await test('Destination filters, search and prefilled request',async()=>{
    await page.getByRole('button',{name:'طبیعت',exact:true}).click();assert.equal(await page.locator('.destination-card').count(),2);assert.match((await page.locator('.destination-card').allInnerTexts()).join(' '),/تاجیکستان/);await page.getByRole('button',{name:'همه مقصدها',exact:true}).click();const search=page.getByRole('searchbox',{name:'جستجو در مقصدها',exact:true});await search.fill('ایران');assert.equal(await page.locator('.destination-card').count(),1);await page.getByRole('button',{name:'خدمات این مقصد',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'آماده‌سازی درخواست',exact:true}).click();assert.equal(await page.getByRole('dialog').getByLabel('مقصد',{exact:true}).inputValue(),'ایران');await page.keyboard.press('Escape');await search.fill('')
  })
  await test('Consultant summary and explicit WhatsApp handoff',async()=>{
    await page.getByRole('button',{name:'شروع درخواست',exact:true}).first().click();const dialog=page.getByRole('dialog');await dialog.getByLabel('خدمت مورد نظر',{exact:true}).selectOption({label:'ویزا و اقامت'});await dialog.getByLabel('مقصد',{exact:true}).fill('ایران');await dialog.getByLabel('تعداد مسافران',{exact:true}).fill('2');await dialog.getByRole('button',{name:'مرور پیام درخواست',exact:true}).click();const link=dialog.getByRole('link',{name:'باز کردن واتساپ دفتر',exact:true});const target=new URL(await link.getAttribute('href'));assert.equal(target.hostname,'wa.me');assert.equal(target.pathname,'/93777377774');assert.match(target.searchParams.get('text'),/ایران/);assert.match(target.searchParams.get('text'),/2/);assert.equal(external.length,0);await page.keyboard.press('Escape')
  })
  await test('FAQ reveals real guidance',async()=>{const summary=page.locator('#faq summary').first();await summary.click();assert.equal(await page.locator('#faq details').first().getAttribute('open'),'');assert.match(await page.locator('#faq details').first().innerText(),/اسناد هویتی/);await summary.click()})
  await test('Phone typography, clear controls and dark panel contrast',async()=>{
    await page.setViewportSize({width:393,height:852});
    if(await page.locator('html').getAttribute('data-theme')!=='dark') await page.getByRole('button',{name:'فعال کردن حالت تاریک',exact:true}).click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
    assert.ok(await page.locator('#finder select').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16);
    assert.ok(await page.locator('.destination-copy h3').first().evaluate(e=>Number(getComputedStyle(e).fontWeight))>=800);
    assert.equal(await page.locator('.floating-ai').isVisible(),false);
    const ratio=await page.locator('#deals').evaluate(e=>{
      const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      const foreground=getComputedStyle(e.querySelector('h2')).color.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number);
      const stops=[...getComputedStyle(e).backgroundImage.matchAll(/rgb\(([^)]+)\)/g)].map(m=>m[1].match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number));
      if(!stops.length) return 0;
      return Math.min(...stops.map(c=>{const a=lum(foreground),b=lum(c);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}));
    });assert.ok(ratio>=4.5,'Dark panel contrast '+ratio);
    for(const width of [320,360,393,768,1440]) {await page.setViewportSize({width,height:852});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Dark overflow '+width)}
  })
  await test('Finder preserves Iran, purpose and nationality through request',async()=>{
    await page.setViewportSize({width:1440,height:1000});await page.goto(url,{waitUntil:'networkidle'});
    await page.getByLabel('مقصد',{exact:true}).selectOption({label:'ایران'});await page.getByLabel('هدف سفر',{exact:true}).selectOption({label:'سیاحت'});await page.getByRole('button',{name:'نمایش خدمات مرتبط',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'انتخاب این خدمت',exact:true}).first().click();const dialog=page.getByRole('dialog');
    assert.equal(await dialog.getByLabel('مقصد',{exact:true}).inputValue(),'ایران');assert.equal(await dialog.getByLabel('خدمت مورد نظر',{exact:true}).inputValue(),'ویزا و اقامت');
    await dialog.getByRole('button',{name:'مرور پیام درخواست',exact:true}).click();const href=await dialog.getByRole('link',{name:'باز کردن واتساپ دفتر',exact:true}).getAttribute('href');const text=new URL(href).searchParams.get('text');assert.match(text,/هدف سفر: سیاحت/);assert.match(text,/تابعیت: افغانستان/);await page.keyboard.press('Escape');
  })
  await test('Service and bundle choices prefill their real request',async()=>{
    await page.getByRole('button',{name:'بررسی گزینه‌ها',exact:true}).nth(2).click();await page.getByRole('dialog').getByRole('button',{name:'آماده‌سازی درخواست',exact:true}).click();assert.equal(await page.getByRole('dialog').getByLabel('خدمت مورد نظر',{exact:true}).inputValue(),'پرواز و هتل');await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'بسته سفر کاری',exact:true}).click();const dialog=page.getByRole('dialog');assert.equal(await dialog.getByLabel('خدمت مورد نظر',{exact:true}).inputValue(),'دعوتنامه و تجارت');await dialog.getByRole('button',{name:'مرور پیام درخواست',exact:true}).click();assert.match(await dialog.locator('.request-summary').innerText(),/بسته: بسته سفر کاری/);await page.keyboard.press('Escape');
  })
  await test('Contact flow offers contact rather than new-order form',async()=>{
    await page.getByRole('button',{name:'پیگیری پرونده',exact:true}).click();const dialog=page.getByRole('dialog');assert.equal(await dialog.getByRole('button',{name:'آماده‌سازی درخواست',exact:true}).count(),0);assert.equal(await dialog.getByRole('link',{name:'تماس با دفتر در واتساپ',exact:true}).getAttribute('href'),'https://wa.me/93777377774');await page.keyboard.press('Escape');
    assert.equal(await page.locator('.floating-ai').count(),0);assert.equal(await page.locator('svg.lucide-sparkles').count(),0);
  })
  await test('Deferred dialog loads only after an explicit request',async()=>{
    const p=page;await p.setViewportSize({width:393,height:852});const chunks=[];p.on('request',r=>{if(r.url().includes('/assets/DetailsDialog-'))chunks.push(r.url())});await p.goto(url,{waitUntil:'networkidle'});assert.equal(chunks.length,0);await p.getByRole('button',{name:'شروع درخواست',exact:true}).first().click();await p.getByRole('dialog').waitFor();assert.equal(chunks.length,1);await p.keyboard.press('Escape');
  })
  await test('Destination favorites persist and remain removable',async()=>{
    await page.getByRole('button',{name:'افزودن پاکستان به منتخب‌ها',exact:true}).click();await page.getByRole('button',{name:'منتخب‌های من (1)',exact:true}).click();assert.equal(await page.locator('.destination-card').count(),1);assert.match(await page.locator('.destination-card').innerText(),/پاکستان/);
    await page.reload({waitUntil:'networkidle'});assert.equal(await page.getByRole('button',{name:'حذف پاکستان از منتخب‌ها',exact:true}).getAttribute('aria-pressed'),'true');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fajr-parsa-destination-favorites-v1')));assert.deepEqual(saved,['پاکستان']);await page.getByRole('button',{name:'منتخب‌های من (1)',exact:true}).click();assert.equal(await page.locator('.destination-card').count(),1);await page.getByRole('button',{name:'حذف پاکستان از منتخب‌ها',exact:true}).click();assert.equal(await page.locator('.destination-card').count(),0);assert.match(await page.locator('.empty-destinations').innerText(),/هنوز مقصدی انتخاب نکرده/);await page.getByRole('button',{name:'منتخب‌های من (0)',exact:true}).click();assert.equal(await page.locator('.destination-card').count(),7);
  })
  await test('Editorial photo opens honest image detail and preserves destination',async()=>{
    await page.getByRole('button',{name:'تماشای پاکستان',exact:true}).click();const dialog=page.getByRole('dialog');assert.match(await dialog.innerText(),/تصویرسازی با هوش مصنوعی/);assert.match(await dialog.locator('img').getAttribute('src'),/hunza-editorial-ai-large/);await dialog.getByRole('button',{name:'آماده‌سازی درخواست',exact:true}).click();assert.equal(await page.getByRole('dialog').getByLabel('مقصد',{exact:true}).inputValue(),'پاکستان');await page.keyboard.press('Escape');
  })
  await test('Featured photo and favorites controls fit phone widths',async()=>{
    for(const width of [320,393,768,1440]) {await page.setViewportSize({width,height:852});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Photo overflow '+width);const favorite=page.getByRole('button',{name:'افزودن پاکستان به منتخب‌ها',exact:true});const box=await favorite.boundingBox();assert.ok(box.width>=44 && box.height>=44)}
  })
  await test('Confirmed country catalog carries Japan request context',async()=>{
    const finder=page.getByLabel('مقصد',{exact:true});assert.equal(await finder.locator('option').count(),16);
    await page.getByRole('button',{name:/^جاپان/}).click();assert.match(await page.getByRole('dialog').innerText(),/یک‌ساله/);await page.getByRole('dialog').getByRole('button',{name:'آماده‌سازی درخواست',exact:true}).click();assert.equal(await page.getByRole('dialog').getByLabel('مقصد',{exact:true}).inputValue(),'جاپان');await page.keyboard.press('Escape');
  })
  await test('Worldwide booking retains selected bundle',async()=>{
    await page.getByRole('button',{name:'درخواست تکت و بوکینگ',exact:true}).click();const dialog=page.getByRole('dialog');assert.equal(await dialog.getByLabel('خدمت مورد نظر',{exact:true}).inputValue(),'پرواز و هتل');assert.match(await dialog.innerText(),/تکت و بوکینگ سراسری/);await page.keyboard.press('Escape');
  })
  await test('No runtime errors or external asset requests',async()=>{assert.deepEqual(failures,[]);assert.deepEqual(external,[])})
} finally {
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,failures,external},null,2))
  console.log(JSON.stringify({results,failures,external},null,2))
  await browser.close();await new Promise(r=>server.close(r))
}
