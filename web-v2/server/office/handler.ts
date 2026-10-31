type Dependencies={enabled:boolean;origin:string;verify:(token:string)=>Promise<string|null>;rateLimit:(user:string)=>Promise<boolean>;list:(user:string,offset:number)=>Promise<unknown>;change:(user:string,id:string,expected:string,status:string)=>Promise<unknown>}
const statuses=['received','reviewing','contacted','closed']
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// Server-only boundary. verify must call trusted Auth; never decode a client JWT as proof.
// list/change must use permission-checking database RPCs, never unrestricted table access.
export async function handleOffice(request:Request,deps:Dependencies):Promise<Response>{
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin','Access-Control-Allow-Origin':deps.origin,'Access-Control-Allow-Headers':'authorization, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}
 const reply=(status:number,body:unknown)=>Response.json(body,{status,headers})
 if(request.headers.get('Origin')!==deps.origin)return Response.json({error:'forbidden'},{status:403,headers:{'Cache-Control':'no-store'}})
 if(!deps.enabled)return reply(503,{error:'office_disabled'})
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
 if(!['GET','POST'].includes(request.method))return reply(405,{error:'method_not_allowed'})
 const token=request.headers.get('Authorization')?.match(/^Bearer ([^\s]{1,8192})$/)?.[1]
 if(!token)return reply(401,{error:'sign_in_required'})
 try{
  const user=await deps.verify(token)
  if(!user||!uuid.test(user))return reply(401,{error:'sign_in_required'})
  // Must be a shared, atomic server quota. A missing or failed limiter fails closed.
  if(!await deps.rateLimit(user))return Response.json({error:'rate_limited'},{status:429,headers:{...headers,'Retry-After':'60'}})
  const url=new URL(request.url)
  if(request.method==='GET'){
   const offset=url.searchParams.get('offset')||'0'
   if(!/^\d{1,6}$/.test(offset))return reply(400,{error:'invalid_request'})
   return reply(200,await deps.list(user,Number(offset)))
  }
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,{error:'json_required'})
  // Bound streamed input even when Content-Length is absent or forged.
  const reader=request.body?.getReader();if(!reader)return reply(400,{error:'invalid_request'})
  let size=0;const chunks:Uint8Array[]=[]
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return reply(413,{error:'too_large'})}chunks.push(value)}
  const bytes=new Uint8Array(size);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length}
  let body:Record<string,unknown>;try{body=JSON.parse(new TextDecoder().decode(bytes))}catch{return reply(400,{error:'invalid_request'})}
  if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).some(key=>!['id','expected','status'].includes(key))||typeof body.id!=='string'||!uuid.test(body.id)||!statuses.includes(String(body.expected))||!statuses.includes(String(body.status))||typeof body.expected!=='string'||typeof body.status!=='string')return reply(400,{error:'invalid_request'})
  return reply(200,await deps.change(user,body.id,body.expected,body.status))
 }catch(error){
  // Only typed internal failures may affect public status; database messages stay private.
  if(error instanceof OfficeDenied)return reply(403,{error:'forbidden'})
  if(error instanceof OfficeConflict)return reply(409,{error:'refresh_required'})
  return reply(503,{error:'temporarily_unavailable'})
 }
}
export class OfficeDenied extends Error{}
export class OfficeConflict extends Error{}
