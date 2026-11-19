import test from 'node:test'
import assert from 'node:assert/strict'
import {summarizeOfficePage} from '../src/office-v2/live-office-summary.ts'
const base={service:'Synthetic',destination:'QA',contact:'nobody@example.invalid'}
const make=(n,status)=>({...base,id:'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),status})
test('first-page summary counts only validated, authorized, returned statuses',()=>{
 const s=summarizeOfficePage([make(1,'received'),make(2,'reviewing'),make(3,'contacted'),make(4,'closed')])
 assert.deepEqual(s,{shown:4,received:1,reviewing:1,contacted:1,closed:1,possiblyMore:false})
})
test('duplicate record IDs do not inflate first-page counts',()=>{
 assert.deepEqual(summarizeOfficePage([make(1,'received'),make(1,'received')]).shown,1)
})
test('an empty page returns zeros but is not an offline error',()=>{
 assert.deepEqual(summarizeOfficePage([]),{shown:0,received:0,reviewing:0,contacted:0,closed:0,possiblyMore:false})
})
test('a full page is NOT automatically a global total',()=>{
 const s=summarizeOfficePage(Array.from({length:25},(_,i)=>make(i+1,'received')))
 assert.equal(s.shown,25)
 assert.equal(s.possiblyMore,true)
 assert.throws(()=>summarizeOfficePage(Array.from({length:26},(_,i)=>make(i+1,'received'))),RangeError)
})
test('invalid statuses do not become counts even with a safe ID',()=>{
 const s=summarizeOfficePage([make(1,'pending')])
 assert.equal(s.shown,0)
})
