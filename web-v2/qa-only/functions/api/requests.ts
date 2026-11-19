// FP-09 secret-free Pages QA proxy. Not deployed from the normal static site.
// The existing Supabase Edge v4 owns secrets, Turnstile, quota, and database writes.
const qaOrigin='https://fp-intake-safe-review.fajr-parsa-qa.pages.dev'
const edgeUrl='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa'
const h={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const knownErrors=new Set(['origin_denied','invalid_request','qa_synthetic_contact_required','challenge_failed','try_later','intake_not_enabled','temporarily_unavailable','json_required','unexpected_field'])
const off=()=>Response.json({error:'intake_not_enabled'},{status:503,headers:h})
type Context={request:Request;fetcher?:typeof fetch}
async function readBounded(request:Request):Promise<string>{
  if(!request.body)throw Error('missing_body')
  const reader=request.body.getReader()
  const chunks:Uint8Array[]=[];let length=0
  try{
    while(true){
      const {value,done}=await reader.read()
      if(done)break
      length+=value.byteLength
      if(length>4096){await reader.cancel();throw Error('over_limit')}
      chunks.push(value)
    }
  }finally{reader.releaseLock()}
  const all=new Uint8Array(length);let offset=0
  for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.byteLength}
  return new TextDecoder('utf-8',{fatal:true}).decode(all)
}
export async function onRequest(context:Context):Promise<Response>{
  const {request}=context;const url=new URL(request.url)
  if(url.origin!==qaOrigin||url.pathname!=='/api/requests'||request.method!=='POST'||request.headers.get('Origin')!==qaOrigin)return off()
  if(request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return off()
  try{
    const raw=await readBounded(request)
    const payload=JSON.parse(raw) as Record<string,unknown>
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.contact!=='string'||!payload.contact.toLowerCase().endsWith('@example.invalid')||payload.consent!==true){
      return Response.json({error:'qa_synthetic_contact_required'},{status:400,headers:h})
    }
    const upstream=await (context.fetcher??fetch)(edgeUrl,{method:'POST',headers:{Origin:qaOrigin,'Content-Type':'application/json'},body:raw,redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(12000)})
    if(upstream.status===200||upstream.status===201){
      const result=await upstream.json() as Record<string,unknown>
      if(result.status!=='received'||typeof result.receipt!=='string'||!uuid.test(result.receipt)||typeof result.replayed!=='boolean')return off()
      return Response.json({status:'received',receipt:result.receipt,replayed:result.replayed},{status:upstream.status,headers:h})
    }
    if([400,403,415,429,503].includes(upstream.status)){
      const result=await upstream.json() as Record<string,unknown>
      return Response.json({error:typeof result.error==='string'&&knownErrors.has(result.error)?result.error:'temporarily_unavailable'},{status:upstream.status,headers:h})
    }
    return off()
  }catch{return off()}
}
