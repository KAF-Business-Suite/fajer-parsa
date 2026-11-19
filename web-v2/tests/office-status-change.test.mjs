import test from 'node:test'
import assert from 'node:assert/strict'
import {changeOfficeRequestStatus} from '../src/office-v2/office-status-change.ts'
const row={id:'00000000-0000-4000-8000-000000000001',service:'Synthetic',destination:'QA only',contact:'nobody@example.invalid',status:'received'}

test('explicit write sends expected state through same-origin BFF and verifies the exact record via GET',async()=>{
 const calls=[]
 const transport=async(url,opts)=>{
  calls.push({url,opts})
  if(opts.method==='POST')return Response.json({id:row.id,status:'reviewing'})
  return Response.json([{...row,status:'reviewing'}])
 }
 const r=await changeOfficeRequestStatus(row,'reviewing',2,transport)
 assert.equal(r.status,'verified')
 assert.equal(r.items[0].status,'reviewing')
 assert.equal(calls.length,2)
 assert.equal(calls[0].url,'/api/office')
 assert.equal(calls[0].opts.method,'POST')
 assert.equal(calls[0].opts.credentials,'same-origin')
 assert.equal(calls[0].opts.redirect,'error')
 assert.equal(calls[0].opts.cache,'no-store')
 assert.deepEqual(calls[0].opts.headers,{'X-FP-Office-Request':'same-origin','Content-Type':'application/json',Accept:'application/json'})
 assert.deepEqual(JSON.parse(calls[0].opts.body),{id:row.id,expected:'received',status:'reviewing'})
 assert.equal(calls[0].opts.headers.Authorization,undefined)
 assert.equal(calls[1].url,'/api/office?offset=50')
 assert.equal(calls[1].opts.method,'GET')
})
test('invalid, same-status or out-of-bounds attempts cannot make requests',async()=>{
 let n=0
 const transport=async()=>{n++;return Response.json([])}
 for(const [candidate,target,page] of [
  [{...row,id:'fake'},'reviewing',0],
  [row,'received',0],
  [row,'approved',0],
  [row,'reviewing',-1],
  [row,'reviewing',40000]
 ]){
  const r=await changeOfficeRequestStatus(candidate,target,page,transport)
  assert.equal(r.status,'invalid_request')
 }
 assert.equal(n,0)
})
test('expired, noneditor, conflict and quota statuses fail closed without readback or success',async()=>{
 for(const [code,expected] of [[401,'sign_in_required'],[403,'access_denied'],[409,'conflict'],[429,'rate_limited'],[400,'invalid_request'],[503,'unverified']]){
  let calls=0
  const r=await changeOfficeRequestStatus(row,'reviewing',0,async()=>{
   calls++
   return Response.json({error:'redacted'},{status:code})
  })
  assert.equal(r.status,expected)
  assert.equal(r.items,null)
  assert.equal(calls,1)
 }
})
test('do not declare success unless response and permissioned readback agree',async()=>{
 const failCases=[
  {ack:{id:row.id,status:'received'},rows:[{...row,status:'reviewing'}]},
  {ack:{id:row.id,status:'reviewing'},rows:[row]},
  {ack:{id:row.id,status:'reviewing'},rows:[]},
  {ack:{id:row.id,status:'reviewing'},rows:{error:'invalid'}},
 ]
 for(const c of failCases){
  const r=await changeOfficeRequestStatus(row,'reviewing',0,async(_url,opts)=>
   opts.method==='POST'?Response.json(c.ack):Response.json(c.rows))
  assert.equal(r.status,'unverified')
  assert.equal(r.items,null)
 }
 const down=await changeOfficeRequestStatus(row,'reviewing',0,async(url,opts)=>{
  if(opts.method==='POST')return Response.json({id:row.id,status:'reviewing'})
  return Response.json({error:'quota'},{status:429})
 })
 assert.equal(down.status,'unverified')
 assert.equal(down.items,null)
 const network=await changeOfficeRequestStatus(row,'reviewing',0,async()=>{throw Error('transport_secret')})
 assert.equal(network.status,'unverified')
})
