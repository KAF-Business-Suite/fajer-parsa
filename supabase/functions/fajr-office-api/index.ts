import {handleOffice} from './handler.ts'
import {officeDependencies} from './adapters.ts'

// Protected staff API. This deployment has no public HTML and no anonymous data access.
// This origin is the separate no-production Cloudflare Worker office preview.
const officeOrigin='https://fajr-office-qa.khoojafahim.workers.dev'
Deno.serve(async request=>{
 try{
  const url=Deno.env.get('SUPABASE_URL')
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if(!url||!key)return Response.json({error:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})
  return await handleOffice(request,officeDependencies({
    enabled:true,origin:officeOrigin,projectUrl:url,serverKey:key
  }))
 }catch{return Response.json({error:'temporarily_unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})}
})
