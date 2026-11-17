import test from 'node:test'
import assert from 'node:assert/strict'
import {addBookmark,detachFromConsole,relinkInConsole,previewSeed,validatePublicUrl,supportedRights} from '../src/office-v2/resource-registry.ts'

test('URL-only connection is bookmark-only and cannot grant administrative privileges',()=>{
 const x=addBookmark(previewSeed,{name:'Second Site',url:'https://example.com/sales',provider:'WordPress',kind:'website',workspace:'Personal'})
 assert.equal(x.error,null)
 assert.equal(x.items.length,previewSeed.length+1)
 assert.equal(x.items.at(-1).status,'bookmark')
 assert.deepEqual([...x.items.at(-1).capabilities],['view-public'])
 assert.equal(x.items.at(-1).workspace,'Personal')
 assert.ok(!x.items.at(-1).capabilities.includes('publish'))
 assert.notDeepEqual(x.items,previewSeed)
 assert.equal(previewSeed.length,3)
})
test('detach only changes association status and preserves source metadata; reconnect reverses',()=>{
 const original=previewSeed.map(x=>({...x}))
 const detached=detachFromConsole(original,'sample-fajr')
 assert.equal(detached[0].status,'detached')
 assert.equal(original[0].status,'bookmark')
 for(const key of ['id','name','url','provider','workspace','kind'])
  assert.equal(detached[0][key],original[0][key])
 assert.deepEqual(relinkInConsole(detached,'sample-fajr'),original)
 assert.ok(!('delete' in supportedRights))
})
test('duplicate active URLs rejected, detached URL can be readded as a new listing',()=>{
 const req={name:'Fajr another listing',url:'https://fajr-parsa-qa.pages.dev',provider:'Cloudflare',kind:'website',workspace:'Fajr Parsa'}
 assert.equal(addBookmark(previewSeed,req).error,'duplicate')
 const detached=detachFromConsole(previewSeed,'sample-fajr')
 assert.equal(addBookmark(detached,req).error,null)
})
test('block risky or private/untrusted urls without network access',()=>{
 for(const url of ['http://example.com','javascript:alert(1)','https://localhost','https://127.0.0.1','https://10.0.0.2','https://a.local','https://admin.internal','https://user:pass@example.com','https://example.com:444','https://[::1]/','ftp://example.com','not a URL','https://foo..bar.com']){
  assert.equal(validatePublicUrl(url),null,url)
 }
 assert.equal(validatePublicUrl('https://example.org/news#secret'),'https://example.org/news')
 assert.equal(validatePublicUrl('https://www.openai.com/'),'https://www.openai.com/')
})
