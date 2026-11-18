import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {preview} from 'vite'
import {chromium} from 'playwright'

const configFile=fileURLToPath(new URL('../vite.office.config.ts',import.meta.url))
const contrast=(fg,bg)=>{
 const rgb=s=>s.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
 const a=rgb(fg.replace('#','')),b=rgb(bg.replace('#',''))
 const lum=x=>x[0]*.2126+x[1]*.7152+x[2]*.0722
 const A=lum(a),B=lum(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05)
}
test('FP-UI-01 token palette: normal text contrast AA and one semantic brand',()=>{
 for(const [fg,bg] of [['#1A3040','#FFFEFC'],['#566976','#FFFEFC'],['#E9EBE9','#1A2B38'],['#B9C7CC','#1A2B38'],['#D1AF78','#192C39']])
  assert.ok(contrast(fg,bg)>=4.5,fg+' contrast against '+bg+' is '+contrast(fg,bg))
})
test('FP-UI-01 S21 360/393 and 1280: two modes, nonsecret persistence, same nav geometry, no network',async()=>{
 await mkdir('test-results',{recursive:true})
 const server=await preview({configFile,preview:{host:'127.0.0.1',port:4181,strictPort:false}})
 const port=server.httpServer.address().port
 const base='http://127.0.0.1:'+port+'/office-preview.html'
 const browser=await chromium.launch({headless:true})
 const external=[]
 try{
  for(const width of [360,393,1280]){
   const context=await browser.newContext({viewport:{width,height:820},isMobile:width<801,hasTouch:width<801,reducedMotion:'reduce'})
   const page=await context.newPage(),errors=[]
   page.on('pageerror',e=>errors.push(String(e)))
   page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:'+port+'/'))external.push(req.url())})
   await page.goto(base+'#/overview',{waitUntil:'networkidle',timeout:25000})
   const root=page.locator('.fpx-root')
   assert.equal(await root.getAttribute('data-theme'),'light')
   assert.equal(await root.getAttribute('data-tone'),'champagne')
   const initial=await page.evaluate(()=>{
    const r=document.querySelector('.fpx-root'),h=document.querySelector('.fpx-header'),n=document.querySelector('.fpx-mobile-tabs'),sb=document.querySelector('.fpx-sidebar')
    const styles=getComputedStyle(r)
    return {background:styles.backgroundColor,canvas:styles.getPropertyValue('--fpx-canvas').trim(),
     font:styles.fontFamily,header:Math.round(h.getBoundingClientRect().height),
     nav:Math.round(n.getBoundingClientRect().height),sidebar:Math.round(sb.getBoundingClientRect().width),
     scroll:document.documentElement.scrollWidth,viewport:innerWidth}
   })
   assert.equal(initial.canvas,'#F4F1EB')
   assert.match(initial.font,/Estedad Variable/)
   assert.equal(initial.scroll<=initial.viewport+2,true)
   assert.equal(initial.header,width<801?56:65)
   if(width<801){
    assert.equal(await page.locator('.fpx-mobile-tabs button').count(),5)
    assert.ok(initial.nav>=60&&initial.nav<=85)
    const taps=await page.locator('.fpx-header .fpx-menu-mobile,.fpx-header .fpx-lang-switch,.fpx-header .fpx-avatar').evaluateAll(xs=>xs.map(x=>({height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width})))
    assert.ok(taps.every(t=>t.height>=44),'top menu/language/avatar touch targets '+JSON.stringify(taps))
   }else assert.equal(initial.sidebar,267)
   await page.screenshot({path:'test-results/fp-ui01-'+width+'-light.png',fullPage:true})
   // Open the existing 'Design system' feature through unchanged navigation.
   if(width<801){
    await page.locator('.fpx-mobile-tabs button').last().click()
    await page.locator('.fpx-mobile-drawer .fpx-drawer-list button').filter({hasText:'دیزاین سیستم'}).click()
   }else{
    await page.locator('.fpx-group-head').filter({hasText:'مدیریت پلتفرم'}).click()
    await page.locator('.fpx-sidebar .fpx-nav-item').filter({hasText:'دیزاین سیستم'}).click()
   }
   await page.locator('.fpx-theme-lab').waitFor()
   assert.equal(await page.getByRole('button',{name:'سیستم',exact:true}).count(),0)
   assert.equal(await page.getByRole('button',{name:'آبی',exact:true}).count(),0)
   assert.equal(await page.getByRole('button',{name:'یشمی',exact:true}).count(),0)
   // The registered layout keeps density and corner controls, but NOT extra palettes.
   await page.getByRole('button',{name:/تاریک/}).click()
   await page.waitForFunction(()=>document.querySelector('.fpx-root')?.getAttribute('data-theme')==='dark')
   let dark=await root.evaluate(r=>({background:getComputedStyle(r).backgroundColor,canvas:getComputedStyle(r).getPropertyValue('--fpx-canvas').trim()}))
   assert.equal(dark.canvas,'#111C26')
   // Wait for painted background to settle after React attribute/theme update.
   try{
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.fpx-root')).backgroundColor==='rgb(17, 28, 38)',null,{timeout:2500})
   }catch(error){
    const diagnostic=await root.evaluate(el=>({theme:el.getAttribute('data-theme'),bg:getComputedStyle(el).backgroundColor,
     cssVariable:getComputedStyle(el).getPropertyValue('--fpx-canvas'),inline:el.getAttribute('style')}))
    console.log('FP_UI01_DARK_BG_DIAG',JSON.stringify(diagnostic))
    throw error
   }
   dark=await root.evaluate(el=>({background:getComputedStyle(el).backgroundColor,canvas:getComputedStyle(el).getPropertyValue('--fpx-canvas').trim()}))
   assert.notEqual(dark.background,initial.background)
   await page.screenshot({path:'test-results/fp-ui01-'+width+'-dark.png',fullPage:true})
   await page.reload({waitUntil:'networkidle'})
   assert.equal(await page.locator('.fpx-root').getAttribute('data-theme'),'dark','theme persists across refresh')
   assert.equal(await page.locator('.fpx-root').getAttribute('data-tone'),'champagne')
   await page.locator('.fpx-lang-switch select').selectOption('en')
   assert.equal(await page.locator('html').getAttribute('dir'),'ltr')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true)
   // Local data preference is not credentials or a simulated provider connection.
   const saved=await page.evaluate(()=>localStorage.getItem('fp-admin-appearance-v1'))
   assert.equal(JSON.parse(saved).mode,'dark')
   assert.deepEqual(Object.keys(JSON.parse(saved)).sort(),['corners','density','mode'])
   assert.deepEqual(errors,[],'runtime errors at '+width)
   await context.close()
  }
  assert.deepEqual(external,[],'Admin design preview must be offline-only')
 }finally{
  await browser.close()
  await new Promise(resolve=>server.httpServer.close(resolve))
 }
})
