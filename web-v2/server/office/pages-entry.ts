import {handleOffice} from './handler.ts'
import {officeDependencies} from './adapters.ts'

/**
 * Future Cloudflare Pages Functions entry; not mounted under /functions.
 * Remains OFF until a reviewed Preview binding, schema and dedicated release gate exist.
 */
type Env={FAJR_OFFICE_ENABLED?:string;FAJR_OFFICE_ORIGIN?:string;SUPABASE_URL?:string;SUPABASE_SERVER_KEY?:string}
export async function onRequest(context:{request:Request;env:Env}):Promise<Response>{
 const {request,env}=context
 const unavailable=()=>Response.json({error:'office_not_enabled'},{status:503,headers:{'Cache-Control':'no-store'}})
 try{
  const origin=new URL(request.url).origin
  // Only isolated QA branch subdomains of the existing Cloudflare project.
  // The production hostname is never allowed by this handler.
  if(!/^https:\/\/[a-z0-9-]+\.fajr-parsa-qa\.pages\.dev$/.test(origin)
    ||env.FAJR_OFFICE_ORIGIN!==origin||env.FAJR_OFFICE_ENABLED!=='true'
    ||!env.SUPABASE_URL||!env.SUPABASE_SERVER_KEY)return unavailable()
  return await handleOffice(request,officeDependencies({
    enabled:true,origin,projectUrl:env.SUPABASE_URL,serverKey:env.SUPABASE_SERVER_KEY
  }))
 }catch{return unavailable()}
}
