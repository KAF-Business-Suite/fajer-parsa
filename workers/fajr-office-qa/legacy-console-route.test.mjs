import test from 'node:test'
import assert from 'node:assert/strict'
import {legacyConsoleNavigation} from './legacy-console-route.mjs'
const base='https://fajr-office-qa.khoojafahim.workers.dev'
const security={'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'}
function get(path,cookie=false){return new Request(base+path,{headers:cookie?{Cookie:'__Host-fp-office-session=synthetic-sealed; fake=unused'}:{}})}
test('old separate pages always redirect to same-origin Admin module, not separate shell',async()=>{
 for(const [path,module,login] of [['/site-settings','website','console-website'],['/resources','resources','console-resources']]){
  const anon=legacyConsoleNavigation(get(path),security)
  assert.equal(anon.status,302)
  assert.equal(anon.headers.get('Location'),'/?next='+login)
  assert.equal(anon.headers.get('Cache-Control'),'private, no-store')
  assert.equal(anon.headers.get('Content-Security-Policy'),security['Content-Security-Policy'])
  const member=legacyConsoleNavigation(get(path,true),security)
  assert.equal(member.status,302)
  assert.equal(member.headers.get('Location'),'/console#/'+module)
  assert.equal((await member.text()),'')
 }
});
test('no attacker-supplied URL or query is ever reflected into redirects',()=>{
 for(const query of ['?next=https%3A%2F%2Fevil.invalid','?utm_source=chatgpt','?redirect=%2F%2Fevil.invalid']){
  const r=legacyConsoleNavigation(get('/site-settings'+query,true),security)
  assert.equal(r.status,302)
  assert.equal(r.headers.get('Location'),'/console#/website')
  assert.doesNotMatch(r.headers.get('Location'),/evil|chatgpt|redirect/)
 }
});
test('unknown paths, host, or non-GET never get new route authority',()=>{
 assert.equal(legacyConsoleNavigation(get('/api/site-settings/draft'),security),null)
 assert.equal(legacyConsoleNavigation(get('/resources.css'),security),null)
 assert.equal(legacyConsoleNavigation(new Request('https://evil.invalid/resources'),security),null)
 assert.equal(legacyConsoleNavigation(new Request(base+'/site-settings',{method:'POST'}),security),null)
});
