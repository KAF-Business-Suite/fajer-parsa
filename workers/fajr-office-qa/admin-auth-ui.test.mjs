import test from 'node:test'
import assert from 'node:assert/strict'
import worker from './worker.mjs'
import {ADMIN_AUTH_HTML,ADMIN_AUTH_CSS,ADMIN_AUTH_JS} from './admin-auth-ui.mjs'

const origin='https://fajr-office-qa.khoojafahim.workers.dev'
test('KAF Admin is a standalone private sign-in document, not a Fajr Office shell',()=>{
 assert.match(ADMIN_AUTH_HTML,/<title>Admin Console \| KAF<\/title>/)
 assert.match(ADMIN_AUTH_HTML,/id="login-view"/)
 assert.match(ADMIN_AUTH_HTML,/id="recover-view"/)
 assert.match(ADMIN_AUTH_HTML,/id="reset-view"/)
 assert.match(ADMIN_AUTH_HTML,/href="\/admin-auth.css"/)
 assert.match(ADMIN_AUTH_HTML,/src="\/admin-auth.js"/)
 assert.match(ADMIN_AUTH_HTML,/KAF BUSINESS SUITE/)
 assert.doesNotMatch(ADMIN_AUTH_HTML,/id="office-view"|\/app.css|\/app.js|دفتر فجرپارسا/)
 assert.doesNotMatch(ADMIN_AUTH_HTML,/ثبت‌نام عمومی فعال است|Create account|Sign up/)
 assert.match(ADMIN_AUTH_HTML,/ثبت‌نام عمومی فعال نیست/)
 assert.match(ADMIN_AUTH_CSS,/@media\(max-width:830px\)/)
 assert.match(ADMIN_AUTH_CSS,/html\[data-theme=dark\]/)
})
test('KAF Admin sign-in uses the existing secure same-origin session BFF',()=>{
 assert.match(ADMIN_AUTH_JS,/post\('\/api\/session\/login'/)
 assert.match(ADMIN_AUTH_JS,/credentials:'same-origin'/)
 assert.match(ADMIN_AUTH_JS,/'X-FP-Office-Request':'same-origin'/)
 assert.match(ADMIN_AUTH_JS,/history\.replaceState\(null,'',nextPrivateView\(\)\);location\.reload\(\)/)
 assert.doesNotMatch(ADMIN_AUTH_JS,/location\.replace\(nextPrivateView\(\)\)/,'Hash-only navigation never refreshes the protected Admin shell')
 assert.match(ADMIN_AUTH_JS,/\/console#\/overview/)
 assert.doesNotMatch(ADMIN_AUTH_JS,/localStorage\.setItem\([^)]*(?:access_token|refresh_token|password)/)
 assert.doesNotMatch(ADMIN_AUTH_JS,/service_role|\bsecretKey\b/)
})
test('KAF Admin recovery is explicit, wipes URL fragment and never offers self registration',()=>{
 assert.match(ADMIN_AUTH_JS,/\/auth\/v1\/recover\?redirect_to=/)
 assert.match(ADMIN_AUTH_JS,/\/console\?mode=recovery/)
 assert.match(ADMIN_AUTH_JS,/history\.replaceState\(null,'','\/console\?mode=recovery'\)/)
 assert.match(ADMIN_AUTH_JS,/addEventListener\('hashchange',\(\)=>\{acceptRecovery\(\)\}\)/,'Same-tab password-reset link must be processed')
 assert.match(ADMIN_AUTH_JS,/recoveryToken=null/)
 assert.match(ADMIN_AUTH_JS,/authBase\+'\/auth\/v1\/user'/)
 assert.doesNotMatch(ADMIN_AUTH_JS,/\/auth\/v1\/signup/)
})
test('Worker serves new independent auth assets; sensitive views remain no-store',async()=>{
 const [page,css,js]=await Promise.all([
  worker.fetch(new Request(origin+'/console')),
  worker.fetch(new Request(origin+'/admin-auth.css')),
  worker.fetch(new Request(origin+'/admin-auth.js'))
 ])
 assert.equal(page.status,200)
 assert.match(await page.text(),/Admin Console \| KAF/)
 assert.equal(page.headers.get('X-Robots-Tag'),'noindex, nofollow')
 assert.equal(page.headers.get('Cache-Control'),'private, no-store')
 assert.match(page.headers.get('Content-Security-Policy'),/script-src 'self'/)
 assert.equal(css.status,200)
 assert.match(css.headers.get('Content-Type'),/text\/css/)
 assert.match(await css.text(),/main-grid/)
 assert.equal(js.status,200)
 assert.match(js.headers.get('Content-Type'),/text\/javascript/)
 assert.match(await js.text(),/recover-form/)
})
test('Recovery callback cannot expose private React HTML even with a cookie',async()=>{
 const r=await worker.fetch(new Request(origin+'/console?mode=recovery',{headers:{Cookie:'__Host-fp-office-session=synthetic-token-not-real'}}),{})
 assert.equal(r.status,200)
 assert.match(await r.text(),/id="reset-view"/)
 assert.equal(r.headers.get('Location'),null)
})
