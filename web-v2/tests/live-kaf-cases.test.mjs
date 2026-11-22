import test from 'node:test'
import assert from 'node:assert/strict'
import {parseKafCases,readKafCases} from '../src/office-v2/live-kaf-cases.ts'
const row={id:'00000000-0000-4000-8000-000000000001',
 workspaceId:'d5072836-0d50-4dfa-88dc-596e9befd276',company:'fajr',
 code:'FP-CASE-01',title:'Synthetic Fajr case',status:'منتظر مدارک',
 dueDate:'2026-12-01',assignedTo:'Synthetic owner',nextAction:'Call client (synthetic)',
 revision:3,updatedAt:'2026-11-18T10:00:00Z'}

test('only existing same-origin KAF BFF; strict GET and no browser bearer or local storage',async()=>{
 const calls=[]
 const result=await readKafCases(2,async(url,opts)=>{calls.push({url,opts});return Response.json([row])})
 assert.deepEqual(result,{status:'ok',items:[row]})
 assert.equal(calls[0].url,'/api/kaf/cases?offset=50')
 assert.equal(calls[0].opts.method,'GET')
 assert.equal(calls[0].opts.credentials,'same-origin')
 assert.equal(calls[0].opts.cache,'no-store')
 assert.equal(calls[0].opts.redirect,'error')
 assert.deepEqual(calls[0].opts.headers,{'X-FP-Office-Request':'same-origin',Accept:'application/json'})
 assert.equal(calls[0].opts.headers.Authorization,undefined)
 assert.equal(calls[0].opts.body,undefined)
})
test('401/403/429/offline failures have zero fake cases and never expose read data',async()=>{
 for(const [status,result] of [[401,'sign_in_required'],[403,'access_denied'],[429,'rate_limited'],[503,'unavailable']]){
  assert.deepEqual(await readKafCases(0,async()=>Response.json({error:'private'},{status})),
   {status:result,items:[]})
 }
 assert.deepEqual(await readKafCases(0,async()=>{throw Error('offline')}),{status:'unavailable',items:[]})
})
test('malformed, extra company and overlimit rows are rejected entirely',()=>{
 for(const data of [
  {items:[row]},null,[{...row,company:'rpc'}],[{...row,id:'bad-id'}],
  [{...row,status:'approved'}],[{...row,nextAction:500}],
  [{...row,dueDate:'2026-01-01<script>'}],[{...row,revision:0}],
  Array.from({length:26},()=>row)
 ])assert.equal(parseKafCases(data),null)
 assert.deepEqual(parseKafCases([]),[])
 assert.deepEqual(parseKafCases([row]),[row])
})
test('no network request for invalid or excessive page offsets',async()=>{
 let count=0
 for(const page of [-1,401,1.2,NaN,Infinity]){
  const r=await readKafCases(page,async()=>{count++;return Response.json([row])})
  assert.equal(r.status,'unavailable')
 }
 assert.equal(count,0)
})
