import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const manifest=JSON.parse(readFileSync(new URL('../release/fp08-readiness.json',import.meta.url),'utf8'))
assert.equal(manifest.documentaryReview?.issuerVerification,'pending')
assert.equal(manifest.documentaryReview?.personalDataCopiedIntoRepository,false)
assert.notEqual(manifest.checks.company_license_and_services.status,'approved','The agency license copy must not be mistaken for issuer validation')
const review=readFileSync(new URL('../release/FP08_LICENSE_SCOPE_REVIEW_20261115.md',import.meta.url),'utf8')
assert.match(review,/2027-03-22/)
assert.match(review,/2027-03-23/)
assert.match(review,/authenticity & service scope not yet verified/i)
const exec=(mode)=>spawnSync(process.execPath,['scripts/fp08-release-gate.mjs',mode],{
  cwd:process.cwd(),encoding:'utf8',timeout:10000
})
const audit=exec('audit')
assert.equal(audit.status,0,'The readiness audit must always report blockers without blocking QA')
assert.match(audit.stdout,/FP08_READINESS=(BLOCKED|READY_FOR_AUTHORIZED_RELEASE)/)
assert.match(audit.stdout,/FP08_CHECKS=7/)
assert.match(audit.stdout,/FP08_SCOPE: no deployment or database mutation/)
const prod=exec('production')
const blocked=audit.stdout.includes('FP08_READINESS=BLOCKED')
if(blocked){
  assert.equal(prod.status,1,'Missing business evidence must fail production closed')
  assert.match(prod.stderr,/FP08_PRODUCTION_RELEASE=DENIED/)
}else{
  assert.equal(prod.status,0,'Only a complete owner-approved evidence manifest can permit release')
  assert.match(prod.stdout,/FP08_PRODUCTION_RELEASE=GATE_PASS/)
}
console.log('PASS FP08: audit non-destructive, evidence fail-closed, no production authorization bypass')
