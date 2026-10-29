// Prepared entrypoint, deliberately not in functions/. Deploy only after QA bindings exist.
import {handleIntake} from './handler.ts'
import {supabaseSaver,turnstileVerifier} from './adapters.ts'
const qaOrigin='https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev'
type Env={FAJR_INTAKE_ENABLED?:string;SUPABASE_URL?:string;SUPABASE_SERVER_KEY?:string;TURNSTILE_SECRET_KEY?:string;FAJR_RATE_LIMIT?:{limit:(options:{key:string})=>Promise<{success:boolean}>}}
export async function onRequest(context:{request:Request;env:Env}){
  const {request,env}=context
  const unavailable=()=>Response.json({error:'intake_not_enabled'},{status:503,headers:{'Cache-Control':'no-store'}})
  // Fail closed on immutable/production hosts and incomplete server configuration.
  if(new URL(request.url).origin!==qaOrigin||env.FAJR_INTAKE_ENABLED!=='true'||!env.FAJR_RATE_LIMIT||!env.SUPABASE_URL||!env.SUPABASE_SERVER_KEY||!env.TURNSTILE_SECRET_KEY)return unavailable()
  try {
    const save=supabaseSaver(env.SUPABASE_URL,env.SUPABASE_SERVER_KEY)
    const verify=turnstileVerifier(env.TURNSTILE_SECRET_KEY,new URL(qaOrigin).hostname)
    const limiter=env.FAJR_RATE_LIMIT
    return await handleIntake(request,request.headers.get('CF-Connecting-IP')||'',{enabled:true,origin:qaOrigin,rateLimit:async ip=>(await limiter.limit({key:'fajr-intake:'+ip})).success,verifyChallenge:verify,save})
  }catch{return unavailable()}
}
