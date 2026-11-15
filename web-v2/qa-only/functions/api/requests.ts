// QA-only Pages Function. No Supabase/Turnstile secrets in Pages preview bindings.
// Delegates strictly on the existing intake QA hostname to a private, service-bound Worker.
const qaOrigin='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev'
type Gateway={fetch:(request:Request)=>Promise<Response>}
type Env={FAJR_INTAKE_ENABLED?:string;FAJR_QA_GATEWAY?:Gateway}
const deny=()=>Response.json({error:'intake_not_enabled'},{status:503,headers:{
  'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'
}})
export async function onRequest(context:{request:Request;env:Env}):Promise<Response>{
  const {request,env}=context
  const url=new URL(request.url)
  // No service call from production, immutable/hash previews, other routes or disabled QA.
  if(url.origin!==qaOrigin||url.pathname!=='/api/requests'||request.method!=='POST')return deny()
  if(env.FAJR_INTAKE_ENABLED!=='true'||typeof env.FAJR_QA_GATEWAY?.fetch!=='function')return deny()
  try {
    return await env.FAJR_QA_GATEWAY.fetch(request)
  }catch{return deny()}
}
