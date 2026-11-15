// FP-09: Prepared QA-only Pages Functions entrypoint. This file deliberately lives
// outside web-v2/functions/ and is not deployed by the normal static-only workflow.
// Promote only after separate QA server bindings, Turnstile and rate-limit review.
import {handleIntake} from './handler.ts'
import {supabaseSaver,turnstileVerifier} from './adapters.ts'

export const qaOrigin='https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev'
type RateLimit={limit:(options:{key:string})=>Promise<{success:boolean}>}
type Env={
  FAJR_INTAKE_ENABLED?:string
  SUPABASE_URL?:string
  SUPABASE_SERVER_KEY?:string
  TURNSTILE_SECRET_KEY?:string
  FAJR_RATE_LIMIT?:RateLimit
}
const unavailable=()=>Response.json({error:'intake_not_enabled'},{
  status:503,headers:{
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'X-Robots-Tag':'noindex'
  }
})
export async function onRequest(context:{request:Request;env:Env}):Promise<Response>{
  const {request,env}=context
  const url=new URL(request.url)
  // Exact allowlist. Do not enable canonical or immutable Pages preview hosts.
  // No network call may occur until the strict QA hostname and all bindings pass.
  if(url.origin!==qaOrigin||url.pathname!=='/api/requests')return unavailable()
  if(env.FAJR_INTAKE_ENABLED!=='true'
      ||typeof env.FAJR_RATE_LIMIT?.limit!=='function'
      ||!env.SUPABASE_URL
      ||!env.SUPABASE_SERVER_KEY
      ||!env.TURNSTILE_SECRET_KEY)return unavailable()
  try {
    const save=supabaseSaver(env.SUPABASE_URL,env.SUPABASE_SERVER_KEY)
    const verify=turnstileVerifier(env.TURNSTILE_SECRET_KEY,url.hostname)
    const limiter=env.FAJR_RATE_LIMIT
    return await handleIntake(
      request,request.headers.get('CF-Connecting-IP')||'',
      {enabled:true,origin:qaOrigin,
        rateLimit:async ip=>(await limiter.limit({key:'fajr-intake:'+ip})).success,
        verifyChallenge:verify,save}
    )
  }catch{return unavailable()}
}
