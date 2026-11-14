// Prepared Cloudflare Pages entrypoint. Deliberately NOT mounted in functions/.
// QA-only opt-in. No production request is accepted by this module.
import {handleIntake} from './handler.ts'
import {supabaseSaver,supabaseIntakeQuota,turnstileVerifier} from './adapters.ts'

type Env={
  FAJR_INTAKE_ENABLED?:string;
  FAJR_INTAKE_ORIGIN?:string;
  SUPABASE_URL?:string;
  SUPABASE_SERVER_KEY?:string;
  TURNSTILE_SECRET_KEY?:string;
}

// This legacy Fajr intake RPC belongs to the existing KAF data authority.
// A changed provider/project is a separate reviewed data-boundary gate.
const approvedProjectOrigin='https://krzxajtrhvupyywovdzy.supabase.co'
function safeProjectUrl(value:string|undefined):boolean {
  if(!value)return false
  try {
    const url=new URL(value)
    return url.origin===approvedProjectOrigin && url.pathname==='/' &&
      !url.username && !url.password && !url.search && !url.hash
  }catch{return false}
}
const unavailable=()=>Response.json({error:'intake_not_enabled'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})

// Project-specific Cloudflare preview *subdomain* only; never the stable production origin.
// Exact preview origin comes from a reviewed server-only binding, not from request headers.
// A default URL, guessed branch name, or unsecured localhost is NOT permitted.
function safePreviewOrigin(origin:string,configured:string|undefined):boolean {
  if(!configured||origin!==configured)return false
  try {
    const u=new URL(origin)
    return u.protocol==='https:' &&
      !u.username && !u.password && !u.port && u.pathname==='/' &&
      !u.search && !u.hash &&
      /^[a-z0-9-]+\.fajr-parsa-qa\.pages\.dev$/.test(u.hostname)
  }catch{return false}
}

export async function onRequest(context:{request:Request;env:Env}):Promise<Response>{
  const {request,env}=context
  let origin:string
  try{origin=new URL(request.url).origin}catch{return unavailable()}
  // No implicit secrets, no production wildcard, no in-memory limiter fallback.
  // The shared, atomic rate limit is enforced by KAF's existing service-only database RPC.
  if(!safePreviewOrigin(origin,env.FAJR_INTAKE_ORIGIN)||
    env.FAJR_INTAKE_ENABLED!=='true'||
    !safeProjectUrl(env.SUPABASE_URL)||!env.SUPABASE_SERVER_KEY||!env.TURNSTILE_SECRET_KEY)return unavailable()

  try{
    const saver=supabaseSaver(env.SUPABASE_URL,env.SUPABASE_SERVER_KEY)
    const verifyChallenge=turnstileVerifier(env.TURNSTILE_SECRET_KEY,new URL(origin).hostname)
    const quota=supabaseIntakeQuota(env.SUPABASE_URL,env.SUPABASE_SERVER_KEY)
    return await handleIntake(request,request.headers.get('CF-Connecting-IP')||'',{
      enabled:true,origin,
      rateLimit:async () => quota(),
      verifyChallenge,save:saver
    })
  }catch{return unavailable()}
}
