import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'

const read=path=>readFile(new URL(path,import.meta.url),'utf8')

test('FP-AUTH-02: all private Admin logout controls return to the same /console login, not old Office root',async()=>{
 const [admin,security]=await Promise.all([
  read('../src/office-v2/EnterpriseConsole.tsx'),
  read('../src/office-v2/SecurityCenter.tsx')
 ])
 for(const [name,source] of [['global',admin],['security',security]]){
  assert.match(source,/fetch\('\/api\/session\/logout'/,name+' must revoke same-origin session')
  assert.match(source,/window\.location\.replace\('\/console'\)/,name+' must return to canonical entry')
  assert.doesNotMatch(source,/window\.location\.replace\('\/'\)/,name+' must not open separate historical root')
 }
 assert.match(security,/fajr-office-qa\.khoojafahim\.workers\.dev\/console#\/security/)
})
test('FP-AUTH-02: central server still owns credentials; React modules are not given new password prompts',async()=>{
 const [server,admin]=await Promise.all([
  read('../../workers/fajr-office-qa/worker.mjs'),
  read('../src/office-v2/EnterpriseConsole.tsx')
 ])
 assert.match(server,/\bhandlePrivateConsole\(/)
 assert.match(server,/loginHtml:HTML/)
 assert.match(server,/FAJR_SESSION_KEY/)
 assert.doesNotMatch(admin,/grant_type=password|fajr-office-qa-session-v1|localStorage\.setItem\(.{0,30}(access_token|refresh_token)/)
})

test('FP-ENTRY-02: the canonical login is presented as Admin Console, with one centered login card',async()=>{
 const server=await read('../../workers/fajr-office-qa/worker.mjs')
 assert.match(server,/ورود اختصاصی به Admin Console فجر پارسا/)
 assert.match(server,/با حساب مدیر وارد شوید. تمام بخش‌های مجاز پس از ورود در همین Admin Console باز می‌شوند/)
 assert.match(server,/FAJR PARSA · ADMIN CONSOLE · PRIVATE QA/)
 assert.match(server,/Admin Console language/)
 assert.match(server,/body\.fp-auth-active main\.wrap\{grid-template-columns:minmax\(0,520px\)/)
 assert.doesNotMatch(server,/یک محیط کاری واحد برای دفتر، درخواست‌ها/)
 assert.doesNotMatch(server,/اتصال امن دفتر/)
 assert.match(server,/location\.replace\('\/console#\/overview'\)/)
})
