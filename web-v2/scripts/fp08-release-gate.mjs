import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const required = [
  'company_license_and_services',
  'public_business_identity_and_contacts',
  'country_service_conditions',
  'written_price_refund_terms',
  'privacy_and_consent_copy',
  'customer_intake_live_security',
  'approved_qa_release_evidence',
]
const mode=process.argv[2]||'audit'
if (!['audit','production'].includes(mode)) {
  console.error('Usage: node scripts/fp08-release-gate.mjs audit|production')
  process.exit(2)
}
let data
try { data=JSON.parse(readFileSync(new URL('../release/fp08-readiness.json',import.meta.url),'utf8')) }
catch(error) { console.error('FP08_READINESS=FAIL; unreadable evidence manifest: '+error.message);process.exit(2) }
assert.equal(data.schemaVersion,1,'Unknown release evidence schema')
assert.equal(data.gate,'KAF-31 / FP-08','Wrong release gate')
const failures=[]
for (const name of required) {
  const item=data.checks?.[name]
  if (!item || !['approved','blocked'].includes(item.status)) {
    failures.push(name+': missing or invalid status')
    continue
  }
  if (item.status!=='approved') {
    failures.push(name+': BLOCKED')
    continue
  }
  if (typeof item.source!=='string' || !/^https:\/\/[^\s]+$/.test(item.source)
      || !item.reviewer || typeof item.reviewer!=='string'
      || !item.reviewedAt || !Number.isFinite(Date.parse(item.reviewedAt))
      || Date.parse(item.reviewedAt)>Date.now()+60000) {
    failures.push(name+': approved without verifiable source, reviewer or date')
  }
}
if (data.productionAuthorization!==true || typeof data.ownerAcceptance!=='string'
    || !/^https:\/\/[^\s]+$/.test(data.ownerAcceptance)) {
  failures.push('owner_releas​e_authorization: missing explicit written approval link')
}
const currentStatus=failures.length===0?'READY_FOR_AUTHORIZED_RELEASE':'BLOCKED'
console.log('FP08_READINESS='+currentStatus)
console.log('FP08_CHECKS='+required.length+'; FP08_BLOCKERS='+failures.length)
for(const line of failures) console.log('FP08_BLOCKER: '+line)
console.log('FP08_SCOPE: no deployment or database mutation from this check')
if (mode==='production' && failures.length) {
  console.error('FP08_PRODUCTION_RELEASE=DENIED; documentary preconditions absent')
  process.exit(1)
}
if (mode==='production') console.log('FP08_PRODUCTION_RELEASE=GATE_PASS; technical deploy guards still apply')
