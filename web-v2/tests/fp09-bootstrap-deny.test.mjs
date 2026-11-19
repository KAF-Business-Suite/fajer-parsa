import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import bootstrap from '../qa-only/worker/bootstrap-disabled.mjs'

const qa='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev/api/requests'
test('FP-09 first deployed private Worker denies all QA posts and requires no bindings',async()=>{
  const response=await bootstrap.fetch(new Request(qa,{method:'POST'}))
  assert.equal(response.status,503)
  assert.deepEqual(await response.json(),{error:'intake_not_enabled'})
  assert.equal(response.headers.get('cache-control'),'no-store')
  assert.equal(response.headers.get('x-robots-tag'),'noindex')
})
test('FP-09 bootstrap denies all other origins, paths and methods',async()=>{
  for(const url of [
    'https://fajr-parsa-qa.pages.dev/api/requests',
    'https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev/api/requests',
    'https://hash.fajr-parsa-qa.pages.dev/api/requests',
    'https://evil.example/api/requests',
    'http://fp-intake-safe-review.fajr-parsa-qa.pages.dev/api/requests',
    'https://fp-intake-safe-review.fajr-parsa-qa.pages.dev/another'
  ])assert.equal((await bootstrap.fetch(new Request(url,{method:'POST'}))).status,404,url)
  assert.equal((await bootstrap.fetch(new Request(qa,{method:'GET'}))).status,404)
})
test('FP-09 bootstrap contains no database credentials or network egress capability',()=>{
  const s=readFileSync(new URL('../qa-only/worker/bootstrap-disabled.mjs',import.meta.url),'utf8')
  assert.ok(s.includes('intake_not_enabled'))
  assert.ok(!/\bSUPABASE_|TURNSTILE_SECRET|cloudflare\.request|globalThis\.fetch|await fetch\(/i.test(s))
})
