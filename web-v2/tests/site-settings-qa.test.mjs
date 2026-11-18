import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet} from '../qa-only/functions/api/site-settings/public.js';
const origin='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev';
const config='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config';
const rpc='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_published_public';
const published={version:1,site:'fajr-parsa',revision:'d5072836-0d50-4dfa-88dc-596e9befd276',publishedAt:'2026-11-16T00:00:00Z',contact:{whatsapp:'93700123456',email:'qa@example.invalid'},design:{fontPreset:'vazirmatn-manrope'}};
const request=host=>({request:new Request(host+'/api/site-settings/public')});
function mock(value=published){const calls=[];const transport=async(url,options)=>{
 calls.push({url,options});
 if(url===config)return Response.json({publishableKey:'sb_publishable_synthetic'});
 if(url===rpc)return Response.json(value);
 throw Error('Unexpected endpoint');
 };return {calls,transport}}
test('strict QA-only host accepts public published projection and no credentials',async()=>{
 const m=mock();const r=await onRequestGet(request(origin),m.transport);
 assert.equal(r.status,200);
 assert.deepEqual(await r.json(),published);
 assert.equal(m.calls.length,2);
 assert.equal(m.calls[1].options.headers.apikey,'sb_publishable_synthetic');
 assert.equal(m.calls[1].options.headers.Authorization,undefined);
 assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('alternate host denied before contacting backend',async()=>{
 const m=mock();const r=await onRequestGet(request('https://fajr-parsa-qa.pages.dev'),m.transport);
 assert.equal(r.status,404);
 assert.equal(m.calls.length,0);
});
test('not yet published returns 404 and existing client fallback remains',async()=>{
 const r=await onRequestGet(request(origin),mock(null).transport);
 assert.equal(r.status,404);
 assert.equal((await r.json()).error,'not_published');
});
test('private keys and malformed snapshot cannot leak to browser',async()=>{
 const m=mock({...published,serviceRole:'never'});
 const r=await onRequestGet(request(origin),m.transport);
 assert.equal(r.status,503);
 const body=await r.text();
 assert.doesNotMatch(body,/serviceRole|never/);
});
test('upstream outage or redirect is fail closed',async()=>{
 const m=mock();const transport=(url,init)=>url===rpc?new Response(null,{status:302,headers:{Location:'https://evil.invalid'}}):m.transport(url,init);
 const r=await onRequestGet(request(origin),transport);
 assert.equal(r.status,503);
});

test('four-language public settings accept only exact approved nested structure',async()=>{
 const text4={fa:'کابل',ps:'کابل',en:'Kabul',ar:'كابل'};
 const value={...published,
  contact:{...published.contact,phone:'+93700123456',mapUrl:'https://maps.app.goo.gl/example123'},
  office:{address:text4,hours:{fa:'۹-۵',ps:'۹-۵',en:'9-5',ar:'٩-٥'}},
  content:{notice:text4,faq:[{question:text4,answer:text4}]}
 };
 const r=await onRequestGet(request(origin),mock(value).transport);
 assert.equal(r.status,200);
 assert.deepEqual(await r.json(),value);
});
test('never expose nested private/draft fields or untrusted phone/maps/translated content',async()=>{
 const text4={fa:'متن',ps:'متن',en:'Text',ar:'نص'};
 const base={...published,
  office:{address:text4,hours:text4},
  content:{notice:text4,faq:[{question:text4,answer:text4}]}
 };
 const blocked=[
  {...base,contact:{...base.contact,phone:'javascript:alert(1)'}},
  {...base,contact:{...base.contact,mapUrl:'https://maps.app.goo.gl.evil.invalid/x'}},
  {...base,contact:{...base.contact,mapUrl:'http://maps.google.com/maps'}},
  {...base,office:{...base.office,privateNote:'do not publish'}},
  {...base,office:{address:{...text4,privatePhone:'do not publish'},hours:text4}},
  {...base,office:{address:{fa:'only Dari'},hours:text4}},
  {...base,content:{...base.content,internalDraft:true}},
  {...base,content:{notice:text4,faq:[{question:text4,answer:{...text4,secret:'do not publish'}}]}},
  {...base,content:{notice:text4,faq:Array(6).fill({question:text4,answer:text4})}},
  {...base,content:{notice:{...text4,fa:'x'.repeat(501)},faq:[]}},
  {...base,contact:{...base.contact,mapUrl:{url:'https://maps.app.goo.gl/a'}}}
 ];
 for(const value of blocked){
  const r=await onRequestGet(request(origin),mock(value).transport);
  assert.equal(r.status,503,'invalid nested public settings must fail closed');
  assert.deepEqual(await r.json(),{error:'temporarily_unavailable'});
 }
});
