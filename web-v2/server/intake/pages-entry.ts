// Prepared Cloudflare Pages entrypoint. Deliberately NOT mounted in functions/.
// QA-only opt-in. No production request is accepted by this module.
import {handleIntake} from './handler.ts'
import {supabaseSaver,turnstileVerifier} from './adapters.ts'

type Env={
  FAJR_INTAKE_ENABLED?:string;
  FAJR_INTAKE_ORIGIN?:string;
  SUPABASE_URL?:string;
  SUPABASE_SERVER_KEY?:string;
  TURNSTILE_SECRET_KEY?:string;
  FAJR_RATE_LIMIT?:{limit:(options:{key:string})=>Promise<{success:boolean}>}
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
  if(!safePreviewOrigin(origin,env.FAJR_INTAKE_ORIGIN)||
    env.FAJR_INTAKE_ENABLED!=='true'||!env.FAJR_RATE_LIMIT||
    !env.SUPABASE_URL||!env.SUPABASE_SERVER_KEY||!env.TURNSTILE_SECRET_KEY)return unavailable()

  try{
    const saver=supabaseSaver(env.SUPABASE_URL,env.SUPABASE_SERVER_KEY)
    const verifyChallenge=turnstileVerifier(env.TURNSTILE_SECRET_KEY,new URL(origin).hostname)
    const limit=env.FAJR_RATE_LIMIT
    return await handleIntake(request,request.headers.get('CF-Connecting-IP')||'',{
      enabled:true,origin,
      rateLimit:async ip=>(await limit.limit({key:'fajr-intake:'+ip})).success,
      verifyChallenge,save:saver
    })
  }catch{return unavailable()}
}
