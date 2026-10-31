import {handleOffice} from './handler.ts'
import {officeDependencies} from './adapters.ts'

// The free Cloudflare Worker serves the HTML. Supabase serves only JSON and
// authenticated office RPCs; its gateway intentionally refuses HTML rendering.
const officeOrigin='https://fajr-office-qa.khoojafahim.workers.dev'
const rootOrigin='https://krzxajtrhvupyywovdzy.supabase.co'
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
const reply=(code:number,body:unknown)=>Response.json(body,{status:code,headers})
function publishable():string{
 try{
  const value=Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}'
  for(const candidate of Object.values(JSON.parse(value))){
   if(typeof candidate==='string'&&candidate.startsWith('sb_publishable_'))return candidate
  }
 }catch{}
 return Deno.env.get('SUPABASE_ANON_KEY')||''
}
Deno.serve(async request=>{
 const path=new URL(request.url).pathname
 if(request.method==='GET'&&(path.endsWith('/fajr-office')||path.endsWith('/fajr-office/')||path==='/'))
   return Response.redirect(officeOrigin,302)
 if(request.method==='GET'&&path.endsWith('/config')){
  const key=publishable()
  return key?reply(200,{publishableKey:key}):reply(503,{error:'config_unavailable'})
 }
 if(path.endsWith('/api/office')&&['GET','POST','OPTIONS'].includes(request.method)){
  const url=Deno.env.get('SUPABASE_URL')
  const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if(!url||!secret||url!==rootOrigin)return reply(503,{error:'office_unavailable'})
  try{return await handleOffice(request,officeDependencies({
   enabled:true,origin:officeOrigin,projectUrl:url,serverKey:secret
  }))}catch{return reply(503,{error:'office_unavailable'})}
 }
 return reply(404,{error:'not_found'})
})
