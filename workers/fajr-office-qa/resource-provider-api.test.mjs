import test from 'node:test'
import assert from 'node:assert/strict'
import {handleFajrPagesRead} from './resource-provider-api.mjs'

const ORIGIN='https://fajr-office-qa.khoojafahim.workers.dev'
const PATH='/api/resources/providers/cloudflare/fajr-parsa-qa'
const ROLE='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_control'
const CF='https://api.cloudflare.com/client/v4/accounts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/pages/projects/fajr-parsa-qa'
const TOKEN='synthetic-never-production-read-token'
const env={FAJR_SESSION_KEY:'synthetic',FAJR_CLOUDFLARE_ACCOUNT_ID:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',FAJR_CLOUDFLARE_READ_TOKEN:TOKEN}
function req(path=PATH,{method='GET',header=true,fetchSite}={}){
 return new Request(ORIGIN+path,{method,headers:{
  ...(header?{'X-FP-Office-Request':'same-origin'}:{}),
  ...(fetchSite?{'Sec-Fetch-Site':fetchSite}:{})
 }})
}
function services(opts={}){
 return {
  guard:r=>r.headers.get('X-FP-Office-Request')==='same-origin'&&r.headers.get('Sec-Fetch-Site')!=='cross-site',
  parseSession:async()=>opts.anon?null:{encrypted:'cookie-only'},
  publicKey:async()=> 'sb_publishable_synthetic',
  restore:async()=>opts.expired?{error:401}:{value:{access:'fake-owner-jwt'},cookie:'sealed-renewal'},
  clearCookie:()=> '__Host-fp-office-session=; Max-Age=0',
  err:(status,error)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}}),
  ok:(payload)=>Response.json(payload,{headers:{'Cache-Control':'no-store'}})
 }
}
function mocked({owner=true,roleStatus=200,cfStatus=200,badProject=false,upstreamDown=false}={}){
 const requests=[]
 return {
  requests,
  transport:async(url,init)=>{
   requests.push({url,method:init.method,redirect:init.redirect,headers:init.headers,body:init.body})
   assert.equal(init.redirect,'manual')
   assert.equal(init.cache,'no-store')
   if(upstreamDown)throw Error('offline')
   if(url===ROLE){
    assert.equal(init.method,'POST')
    assert.equal(init.headers.Authorization,'Bearer fake-owner-jwt')
    assert.equal(init.headers.apikey,'sb_publishable_synthetic')
    assert.equal(JSON.parse(init.body).p_action,'read')
    return Response.json({canEdit:owner,canPublish:owner},{status:roleStatus})
   }
   if(url===CF){
    assert.equal(init.method,'GET')
    assert.equal(init.headers.Authorization,'Bearer '+TOKEN)
    return Response.json({success:true,result:{name:badProject?'other-project':'fajr-parsa-qa',
       subdomain:'fajr-parsa-qa.pages.dev',production_branch:'main',
       id:'never-output-sensitive-id',account_id:'should-not-leak',internal_metadata:{secret:'never'}}},{status:cfStatus})
   }
   throw Error('attempted unexpected upstream '+url)
  }
 }
}
test('exact route only, method and query rejected; never contact provider',async()=>{
 const m=mocked()
 assert.equal(await handleFajrPagesRead(req('/not-a-resource'),env,services(),m.transport),null)
 for(const [request,status] of [[req(PATH,{method:'POST'}),405],[req(PATH+'?project=other'),400],
  [req(PATH,{header:false}),403],[req(PATH,{fetchSite:'cross-site'}),403]]){
  const r=await handleFajrPagesRead(request,env,services(),m.transport)
  assert.equal(r.status,status)
 }
 assert.equal(m.requests.length,0)
})
test('anonymous or revoked session denied without touching owner role or Cloudflare',async()=>{
 const m=mocked()
 assert.equal((await handleFajrPagesRead(req(),env,services({anon:true}),m.transport)).status,401)
 assert.equal((await handleFajrPagesRead(req(),env,services({expired:true}),m.transport)).status,401)
 assert.equal((await handleFajrPagesRead(req(),{},services(),m.transport)).status,503)
 assert.equal(m.requests.length,0)
})
test('Fajr owner role and publish permission required before Cloudflare calls',async()=>{
 for(const flags of [{owner:false},{roleStatus:403},{roleStatus:500}]){
  const m=mocked(flags)
  const r=await handleFajrPagesRead(req(),env,services(),m.transport)
  assert.equal(r.status,flags.roleStatus===500?503:403)
  assert.equal(m.requests.length,1)
  assert.equal(m.requests[0].url,ROLE)
 }
})
test('lack of server-side provider credential fails closed after owner auth',async()=>{
 for(const badEnv of [{...env,FAJR_CLOUDFLARE_READ_TOKEN:''},{...env,FAJR_CLOUDFLARE_ACCOUNT_ID:'bad-id'}]){
  const m=mocked()
  const r=await handleFajrPagesRead(req(),badEnv,services(),m.transport)
  assert.equal(r.status,503)
  assert.deepEqual(await r.json(),{error:'provider_not_configured'})
  assert.equal(m.requests.length,1)
  assert.equal(m.requests[0].url,ROLE)
 }
})
test('verified owner receives only allowlisted Pages READ result, no credentials or unrelated projects',async()=>{
 const m=mocked()
 const r=await handleFajrPagesRead(req(),env,services(),m.transport)
 assert.equal(r.status,200)
 assert.equal(r.headers.get('Cache-Control'),'no-store')
 assert.equal(m.requests.length,2)
 assert.equal(m.requests[1].url,CF)
 assert.deepEqual(m.requests.map(x=>x.method),['POST','GET']) // role read RPC, provider read
 const raw=await r.text(),data=JSON.parse(raw)
 assert.deepEqual(data.allowedActions,['inspect'])
 assert.equal(data.ownerVerified,true)
 assert.equal(data.permission,'read-only')
 assert.equal(data.url,'https://fajr-parsa-qa.pages.dev')
 assert.equal(data.productionBranch,'main')
 assert.doesNotMatch(raw,/synthetic-never|account_id|metadata|never-output|Bearer|fake-owner-jwt|password|pages\/projects\/other/)
})
test('wrong upstream project, outage, 403/500 and malformed provider envelope cannot be presented as connected',async()=>{
 for(const options of [{badProject:true},{cfStatus:403},{cfStatus:500},{upstreamDown:true}]){
  const m=mocked(options)
  const r=await handleFajrPagesRead(req(),env,services(),m.transport)
  assert.equal(r.status,503)
  assert.ok((await r.text()).includes('provider_'))
 }
})
