import test from 'node:test';
import assert from 'node:assert/strict';
import {handleSiteControl} from './site-settings-api.mjs';
const origin='https://fajr-office-qa.khoojafahim.workers.dev';
const rpc='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_control';
const mockResponse=(data,status=200)=>Response.json(data,{status});
const ops=[];
const data={draft:{contact:{whatsapp:'',email:''},design:{fontPreset:'vazirmatn-manrope'}},draftRevision:'d5072836-0d50-4dfa-88dc-596e9befd276',publishedRevision:null,canEdit:true,canPublish:true,history:[]};
const services=(opts={})=>({
 guard:req=>req.headers.get('X-FP-Office-Request')==='same-origin'&&
  (!['POST','PATCH','DELETE'].includes(req.method)||req.headers.get('Origin')===origin),
 parseSession:async()=>opts.anonymous?null:{access:'encrypted-inside-cookie'},
 publicKey:async()=> 'sb_publishable_synthetic',
 restore:async()=>({value:{access:'staff.synthetic.jwt'},cookie:null}),
 clearCookie:()=> '__Host-fp-office-session=; Max-Age=0',
 err:(status,error)=>Response.json({error},{status}),
 ok:payload=>mockResponse(payload),
 limitedBody:async req=>req.json()
});
function req(path,method='GET',body,header=true,originValue=origin){
 return new Request(origin+path,{method,headers:{...(header?{'X-FP-Office-Request':'same-origin'}:{}),...(method==='POST'?{Origin:originValue,'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
}
const transport=async(url,init)=>{
 assert.equal(url,rpc);
 assert.equal(init.redirect,'manual');
 assert.equal(init.headers.apikey,'sb_publishable_synthetic');
 assert.equal(init.headers.Authorization,'Bearer staff.synthetic.jwt');
 const body=JSON.parse(init.body);
 ops.push(body);
 return mockResponse(data)
};
test('reject all cross-site, missing-header, unsupported and unauthenticated requests',async()=>{
 for(const input of [
  [req('/api/site-settings/draft','GET',null,false),services(),403],
  [req('/api/site-settings/publish','POST',{confirmed:true,expected:'x',expectedPublished:''},true,'https://evil.invalid'),services(),403],
  [req('/api/site-settings/draft'),services({anonymous:true}),401],
  [req('/api/site-settings/publish','GET'),services(),405],
 ]){
  const before=ops.length,resp=await handleSiteControl(input[0],{FAJR_SESSION_KEY:'synthetic'},input[1],transport);
  assert.equal(resp.status,input[2]);
  assert.equal(ops.length,before);
 }
});
test('read only authorized draft via scoped JWT, not service role',async()=>{
 const r=await handleSiteControl(req('/api/site-settings/draft'),{FAJR_SESSION_KEY:'synthetic'},services(),transport);
 assert.equal(r.status,200);
 assert.equal((await r.json()).draftRevision,data.draftRevision);
 assert.equal(ops.at(-1).p_action,'read');
 assert.deepEqual(ops.at(-1).p_payload,{});
});
test('draft, preview, publish, rollback call isolated SQL actions',async()=>{
 const calls=[
  ['draft',{expected:data.draftRevision,draft:data.draft}],
  ['preview',{}],
  ['publish',{expected:data.draftRevision,expectedPublished:'',confirmed:true}],
  ['rollback',{targetRevision:'published-synthetic',expectedPublished:'',confirmed:true}]
 ];
 for(const [action,body] of calls){
  const r=await handleSiteControl(req('/api/site-settings/'+action,'POST',body),{FAJR_SESSION_KEY:'synthetic'},services(),transport);
  assert.equal(r.status,200);
  assert.equal(ops.at(-1).p_action,action);
  assert.deepEqual(ops.at(-1).p_payload,body);
 }
});
test('missing confirmation, extra fields and huge requests are rejected',async()=>{
 for(const [action,payload] of [
  ['publish',{expected:data.draftRevision,expectedPublished:''}],
  ['rollback',{targetRevision:'x',expectedPublished:'',confirmed:false}],
  ['draft',{expected:'x',draft:{},role:'owner'}],
  ['draft',{expected:'x',draft:null}]
 ]){
  const r=await handleSiteControl(req('/api/site-settings/'+action,'POST',payload),{FAJR_SESSION_KEY:'synthetic'},services(),transport);
  assert.equal(r.status,400);
 }
});
test('SQL privilege denial, stale revision and outages fail closed with no raw database message',async()=>{
 for(const [code,expectedStatus,error] of [['42501',403,'access_denied'],['40001',409,'stale_revision'],['22023',400,'invalid_request'],['XX000',503,'site_settings_unavailable']]){
  const failed=async()=>mockResponse({code,message:'Sensitive database internal text'},400);
  const r=await handleSiteControl(req('/api/site-settings/draft'),{FAJR_SESSION_KEY:'synthetic'},services(),failed);
  assert.equal(r.status,expectedStatus);
  assert.equal((await r.json()).error,error);
  assert.doesNotMatch(await r.text(),/Sensitive database/);
 }
});
