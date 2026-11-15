import {chromium} from 'playwright'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {resolve,extname,sep} from 'node:path'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
const root='/tmp/fajr-intake-browser-build-20261030'
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',root,'--emptyOutDir'],{env:{...process.env,VITE_FAJR_INTAKE_ENABLED:'true',VITE_FAJR_QA_SYNTHETIC_ONLY:'true',VITE_FAJR_TURNSTILE_SITEKEY:'1x00000000000000000000AA'},stdio:'pipe'})
const server=createServer(async(req,res)=>{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return}try{res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp'})[extname(path)]||'application/octet-stream'});res.end(await readFile(path))}catch{res.end()}})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']})
const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});const payloads=[];const errors=[];const results=[];page.on('pageerror',e=>errors.push(e.message))
const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3bf';let responseMode='retry'
await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({contentType:'text/javascript',body:`window.turnstile={render(el,o){window.__challenge=o.callback;o.callback('synthetic-test-token');el.textContent='تأیید امنیتی شبیه‌سازی‌شده برای آزمون';return 'test-widget'},remove(){},reset(){window.__challenge('fresh-synthetic-token')}}`}))
await page.route('**/api/requests',async route=>{payloads.push(route.request().postDataJSON());if(responseMode==='retry'&&payloads.length===1)return route.fulfill({status:503,contentType:'application/json',body:'{"error":"temporarily_unavailable"}'});return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({status:'received',receipt:responseMode==='malformed'?'fake':receipt,replayed:false})})})
const mark=name=>results.push({name,status:'PASS'})
try{
 await page.goto(url+'/#/country/ir');await page.getByRole('button',{name:'درخواست ویزای درمانی',exact:true}).click();await page.getByRole('button',{name:'مرور پیام درخواست',exact:true}).click();
 assert.equal(await page.locator('.request-alternatives').evaluate(node=>node.open),false,'optional contact methods are collapsed in QA');
 assert.match(await page.locator('.request-alternatives summary').innerText(),/واتساپ و ایمیل دفتر/);
 const submit=page.getByRole('button',{name:'ثبت درخواست اولیه',exact:true});await submit.click();assert.equal(payloads.length,0);await page.getByText('برای ثبت، رضایت تماس را تأیید کنید.',{exact:true}).waitFor();mark('Consent required before any HTTP submission')
 const consent=page.locator('.intake-consent input');await consent.check();await submit.click();assert.equal(payloads.length,0);await page.getByText('شماره تماس یا ایمیل معتبر بنویسید.',{exact:true}).waitFor();mark('Contact validation blocks invalid submission')
 await page.getByLabel('ایمیل ساختگی برای آزمون',{exact:true}).fill('someone@example.com');await submit.click();assert.equal(payloads.length,0);await page.getByText('برای آزمون فقط ایمیل ساختگی با پایان @example.invalid پذیرفته می‌شود.',{exact:true}).waitFor();mark('Real contact is rejected early with a clear QA-only explanation');
 await page.getByLabel('ایمیل ساختگی برای آزمون',{exact:true}).fill('qa@example.invalid');await submit.click();await page.getByRole('alert').filter({hasText:'وضعیت ثبت قطعی نیست'}).waitFor();assert.equal(payloads.length,1);assert.equal(await page.getByLabel('مقصد',{exact:true}).isDisabled(),true);assert.equal(await page.getByLabel('ایمیل ساختگی برای آزمون',{exact:true}).isDisabled(),true);mark('Outage shows uncertainty, freezes the submitted payload and makes no receipt')
 await page.getByRole('button',{name:'بررسی دوبارهٔ همین درخواست',exact:true}).click();await page.getByText('درخواست شما ثبت شد',{exact:true}).waitFor();assert.equal(payloads.length,2);assert.equal(payloads[0].requestId,payloads[1].requestId);assert.notEqual(payloads[0].challenge,payloads[1].challenge);assert.equal(payloads[1].variant,'ویزای درمانی');assert.equal(payloads[1].destination,'ایران');assert.equal(await page.getByText(receipt,{exact:true}).count(),1);assert.equal(await page.getByRole('button',{name:'بررسی دوبارهٔ همین درخواست',exact:true}).count(),0);mark('Retry retains request ID, refreshes challenge and shows only server receipt')
 assert.equal(await page.locator('[data-receipt-source="server"]').count(),1,'Server confirmed receipt component only after persistence')
 assert.equal(await page.locator('.request-draft.is-confirmed').count(),1,'Server receipt switches to a compact completion view')
 assert.equal(await page.locator('.request-alternatives').count(),0,'Pre-submit contact links disappear after receipt')
 assert.equal(await page.locator('.fp-receipt-contact').count(),1,'Contact follow-up remains available after receipt')
 assert.equal(await page.locator('.fp-receipt-contact').evaluate(node=>node.open),false,'Follow-up starts collapsed')
 await page.locator('.fp-receipt-contact summary').click()
 const links=await page.locator('.fp-receipt-contact-links a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')))
 assert.equal(links.length,2);assert.equal(links[0],'https://wa.me/93777377774');assert.match(links[1],/^mailto:fp\.rpc\.khwaja@gmail\.com\?subject=/)
 assert.equal(links.some(h=>h.includes(receipt)),false,'Receipt must not be leaked through external contact links')
 await page.locator('.fp-receipt-contact summary').click()
 assert.equal(await page.locator('.draft-download').isVisible(),false,'Draft download is hidden after server confirmation')
 assert.equal(await page.getByText(receipt,{exact:true}).count(),1,'Full reference displayed without truncation')
 assert.equal(await page.locator('.fp-intake-receipt output').innerText(),receipt)
 assert.equal(await page.locator('.fp-intake-receipt-actions button').count(),2)
 const downloadPromise=page.waitForEvent('download')
 await page.getByRole('button',{name:'دریافت رسید',exact:true}).click()
 const download=await downloadPromise
 assert.equal(download.suggestedFilename(),'fajr-parsa-receipt.txt')
 const receiptFile=await readFile(await download.path(),'utf8')
 assert.ok(receiptFile.includes(receipt)&&receiptFile.includes('ایران')&&receiptFile.includes('ویزا و اقامت'))
 assert.ok(!receiptFile.includes('qa@example.invalid'),'Download must not expose contact details')
 await mkdir('test-results',{recursive:true})
 await page.screenshot({path:'test-results/fp09-receipt-mobile.png',fullPage:true})
 mark('Downloadable server receipt contains exact reference, service and destination, no contact data')

 for(const width of [320,360,393,768,1440]){await page.setViewportSize({width,height:852});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.locator('.fp-dialog').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'Dialog has no horizontal overflow at '+width)}mark('Completion dialog fits 320/360/393/768/1440 with no horizontal overflow')
 await page.keyboard.press('Escape');responseMode='malformed';await page.getByRole('button',{name:'درخواست ویزای درمانی',exact:true}).click();await page.getByRole('button',{name:'مرور پیام درخواست',exact:true}).click();await page.getByLabel('ایمیل ساختگی برای آزمون',{exact:true}).fill('qa@example.invalid');await page.locator('.intake-consent input').check();await page.getByRole('button',{name:'ثبت درخواست اولیه',exact:true}).click();await page.getByRole('alert').filter({hasText:'وضعیت ثبت قطعی نیست'}).waitFor();assert.equal(await page.locator('[data-receipt-source="server"]').count(),0);assert.equal(await page.getByText('درخواست اولیه ثبت شد',{exact:true}).count(),0);mark('Malformed success is rejected without a fake receipt or download')
 assert.deepEqual(errors,[]);mark('No runtime errors')
}finally{await mkdir('test-results',{recursive:true});await writeFile('test-results/intake-form-results.json',JSON.stringify({scope:'Local browser with intercepted API/widget; not live central intake',results,errors},null,2));console.log(JSON.stringify({results,errors}));await browser.close();await new Promise(r=>server.close(r))}
