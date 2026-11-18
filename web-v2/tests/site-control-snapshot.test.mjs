import test from 'node:test'
import assert from 'node:assert/strict'
import {parseSiteControlSnapshot,readSiteControlSnapshot} from '../src/office-v2/site-control-snapshot.ts'
const data={
 draftRevision:'d5072836-0d50-4dfa-88dc-596e9befd276',
 publishedRevision:null,canEdit:true,canPublish:false,
 draft:{contact:{email:'secret-should-not-copy@example.invalid'},customToken:'not-for-ui'},
 history:[{metadata:'private-no-ui'}]
}
test('same-origin read-only Office BFF, no credentials or mutation',async()=>{
 const calls=[]
 const r=await readSiteControlSnapshot(async(path,opts)=>{
  calls.push({path,opts})
  return Response.json(data)
 })
 assert.deepEqual(r,{status:'ready',data:{
  draftRevision:data.draftRevision,publishedRevision:null,canEdit:true,canPublish:false
 }})
 assert.equal(calls[0].path,'/api/site-settings/draft')
 assert.equal(calls[0].opts.method,'GET')
 assert.equal(calls[0].opts.credentials,'same-origin')
 assert.equal(calls[0].opts.cache,'no-store')
 assert.equal(calls[0].opts.redirect,'error')
 assert.deepEqual(calls[0].opts.headers,{'X-FP-Office-Request':'same-origin',Accept:'application/json'})
 assert.equal(calls[0].opts.body,undefined)
 assert.doesNotMatch(JSON.stringify(r),/secret-should-not-copy|private-no-ui|not-for-ui/)
})
test('do not substitute demo settings when session, permission or provider fails',async()=>{
 for(const [status,expected] of [[401,'sign_in_required'],[403,'access_denied'],[429,'rate_limited'],[503,'unavailable']]){
  assert.deepEqual(await readSiteControlSnapshot(async()=>Response.json({error:'fail'},{status})),{status:expected,data:null})
 }
 assert.deepEqual(await readSiteControlSnapshot(async()=>{throw Error('network offline')}),{status:'unavailable',data:null})
 assert.deepEqual(await readSiteControlSnapshot(async()=>Response.json({ok:true})),{status:'unavailable',data:null})
})
test('snapshot parser rejects missing role flags, invalid revision and unsafe backend shapes',()=>{
 for(const x of [null,[],{},data.draft,{...data,canPublish:'true'},{...data,draftRevision:{value:'xyz'}},{...data,draftRevision:'a'.repeat(101)},{...data,publishedRevision:'with spaces'}])
  assert.equal(parseSiteControlSnapshot(x),null)
 assert.deepEqual(parseSiteControlSnapshot({...data,publishedRevision:'rev-003'}),{
  draftRevision:data.draftRevision,publishedRevision:'rev-003',canEdit:true,canPublish:false
 })
})
