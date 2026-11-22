import test from 'node:test'
import assert from 'node:assert/strict'
import {ADMIN_LANGUAGE_KEY,validAdminLanguage,readAdminLanguage,saveAdminLanguage} from '../src/office-v2/admin-preferences.ts'

test('Afghan Dari is the default; language preference is an allowlisted non-secret enum',()=>{
 assert.equal(validAdminLanguage(undefined),'fa')
 assert.equal(validAdminLanguage(null),'fa')
 assert.equal(validAdminLanguage('ps'),'fa')
 assert.equal(validAdminLanguage('en'),'en')
 assert.equal(readAdminLanguage(null),'fa')
})
test('prefers English only when stored explicitly, and writes no other key',()=>{
 const values=new Map()
 const store={getItem:key=>values.get(key)||null,setItem:(key,val)=>values.set(key,val)}
 assert.equal(readAdminLanguage(store),'fa')
 assert.equal(saveAdminLanguage('en',store),true)
 assert.equal(readAdminLanguage(store),'en')
 assert.deepEqual([...values.entries()],[[ADMIN_LANGUAGE_KEY,'en']])
 assert.equal(saveAdminLanguage('fa',store),true)
 assert.equal(readAdminLanguage(store),'fa')
 assert.equal(values.size,1)
})
test('blocked or corrupted local storage falls back without affecting login',()=>{
 assert.equal(readAdminLanguage({getItem(){throw Error('denied')}}),'fa')
 assert.equal(saveAdminLanguage('en',{setItem(){throw Error('denied')}}),false)
 assert.equal(readAdminLanguage({getItem(){return 'http://evil.example'}}),'fa')
})
