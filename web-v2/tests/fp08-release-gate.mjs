import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
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
