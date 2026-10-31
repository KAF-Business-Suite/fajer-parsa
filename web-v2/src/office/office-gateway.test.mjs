import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createOfficeGateway} from './office-gateway.ts'
const id='d5072836-0d50-4dfa-88dc-596e9befd276'
test('no token means no network calls',async()=>{
 let count=0
 const g=createOfficeGateway(async()=>null,async()=>{count++;return Response.json([])})
 await assert.rejects(g.list(0),/sign_in_required/)
 assert.equal(count,0)
})
test('only same-origin authorized requests and expected-state updates',async()=>{
 const calls=[]
 const fetcher=async(path,options)=>{calls.push({path,options});return Response.json(options.method==='GET'?[]:{id,status:'reviewing'})}
 const g=createOfficeGateway(async()=> 'synthetic-user-jwt',fetcher)
 assert.deepEqual(await g.list(25),[])
 assert.deepEqual(await g.change(id,'received','reviewing'),{id,status:'reviewing'})
 assert.deepEqual(calls.map(c=>c.path),['/api/office?offset=25','/api/office'])
 assert.ok(calls.every(c=>c.options.headers.Authorization==='Bearer synthetic-user-jwt'&&c.options.credentials==='omit'&&c.options.cache==='no-store'))
 assert.deepEqual(JSON.parse(calls[1].options.body),{id,expected:'received',status:'reviewing'})
})
test('invalid writes and offsets cannot make requests',async()=>{
 let count=0
 const g=createOfficeGateway(async()=> 'x',async()=>{count++;return Response.json([])})
 for(const offset of [-1,1.5,1000000])await assert.rejects(g.list(offset),/invalid_offset/)
 await assert.rejects(g.change('malformed','received','closed'),/invalid_change/)
 assert.equal(count,0)
})
