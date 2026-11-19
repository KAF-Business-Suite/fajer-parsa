import test from 'node:test'
import assert from 'node:assert/strict'
import {parseOfficeRows,readOfficeRequests} from '../src/office-v2/live-office-requests.ts'

const row={id:'00000000-0000-4000-8000-000000000001',service:'Synthetic Visa',destination:'QA only',contact:'nobody@example.invalid',status:'received'}
test('private office read uses cookie-scoped safe GET, no tokens, and bounded pagination',async()=>{
 const calls=[]
 const transport=async(url,options)=>{
  calls.push({url,options})
  return Response.json([row],{status:200})
 }
 const r=await readOfficeRequests(2,transport)
 assert.equal(r.status,'ok')
 assert.deepEqual(r.items,[row])
 assert.equal(calls[0].url,'/api/office?offset=50')
 assert.equal(calls[0].options.method,'GET')
 assert.equal(calls[0].options.credentials,'same-origin')
 assert.equal(calls[0].options.redirect,'error')
 assert.equal(calls[0].options.cache,'no-store')
 assert.deepEqual(calls[0].options.headers,{'X-FP-Office-Request':'same-origin',Accept:'application/json'})
 assert.equal(calls[0].options.headers.Authorization,undefined)
 assert.equal(calls[0].options.body,undefined)
})
test('private request read returns scoped errors; never substitutes demo data',async()=>{
 for(const [code,result] of [[401,'sign_in_required'],[403,'access_denied'],[429,'rate_limited'],[503,'unavailable']]){
  const r=await readOfficeRequests(0,async()=>Response.json({error:'no_access'},{status:code}))
  assert.deepEqual(r,{status:result,items:[]})
 }
 assert.deepEqual(await readOfficeRequests(0,async()=>{throw Error('network')}),{status:'unavailable',items:[]})
 assert.deepEqual(await readOfficeRequests(0,async()=>Response.json({items:[row]})),{status:'unavailable',items:[]})
})
test('malformed or excessive records never appear as verified rows',async()=>{
 for(const item of [[...Array.from({length:26},()=>row)],[{...row,status:'pending'}],[{...row,id:'not-a-uuid'}],[{...row,status:null}],null]){
  assert.equal(parseOfficeRows(item),null)
 }
 assert.deepEqual(parseOfficeRows([{...row,service:'a'.repeat(260)}]),[{...row,service:''}])
})
test('invalid page numbers never issue a network request',async()=>{
 let calls=0
 for(const value of [-1,40000,1.5,Number.NaN]){
  const r=await readOfficeRequests(value,async()=>{calls++;return Response.json([row])})
  assert.equal(r.status,'unavailable')
 }
 assert.equal(calls,0)
})
