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
