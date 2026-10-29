import {handleIntake} from './handler.ts'
import {supabaseSaver,turnstileVerifier} from './adapters.ts'
const origin='https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev'
type Env={SUPABASE_URL?:string;SUPABASE_SERVICE_ROLE_KEY?:string}
export async function handleEdge(request:Request,env:Env,fetcher:typeof fetch=fetch):Promise<Response>{
  const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
  const reply=(status:number,body:object)=>Response.json(body,{status,headers:cors})
  if(request.headers.get('Origin')!==origin)return Response.json({error:'origin_denied'},{status:403,headers:{'Cache-Control':'no-store'}})
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors})
  if(request.method!=='POST')return reply(405,{error:'method_not_allowed'})
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return reply(503,{error:'intake_not_enabled'})
  try{
    const base=new URL(env.SUPABASE_URL)
    if(base.origin!=='https://krzxajtrhvupyywovdzy.supabase.co')return reply(503,{error:'intake_not_enabled'})
    const rpc=async(name:string)=>{
      const response=await fetcher(new URL('/rest/v1/rpc/'+name,base),{method:'POST',headers:{'Content-Type':'application/json',apikey:env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY!},body:'{}',signal:AbortSignal.timeout(5000)})
      if(!response.ok)throw Error('server unavailable')
      return response.json()
    }
    const config=await rpc('fajr_intake_configuration') as {enabled?:boolean;secret?:string}
    if(config?.enabled!==true||typeof config.secret!=='string'||!config.secret)return reply(503,{error:'intake_not_enabled'})
    const verify=turnstileVerifier(config.secret,new URL(origin).hostname,fetcher)
    const save=supabaseSaver(base.origin,env.SUPABASE_SERVICE_ROLE_KEY,fetcher)
    // A database-serialized GLOBAL QA cap: 12 attempts/minute, 100/day. Not an IP-based limit.
    const externalRequest=new Request('https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa',request)
    const result=await handleIntake(externalRequest,'global-qa',{enabled:true,origin,isContactAllowed:value=>value.endsWith('@example.invalid'),rateLimit:async()=>await rpc('fajr_take_intake_slot')===true,verifyChallenge:token=>verify(token,''),save})
    const headers=new Headers(result.headers);for(const [key,value]of Object.entries(cors))headers.set(key,value)
    return new Response(result.body,{status:result.status,headers})
  }catch{return reply(503,{error:'temporarily_unavailable'})}
}
