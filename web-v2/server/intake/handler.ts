// Server-only preparation. This directory is not a Pages Functions entrypoint.
export type Intake = { requestId:string; service:string; destination:string; variant:string; contact:string; consent:true }
export type Dependencies = {
  enabled:boolean; origin:string;
  rateLimit:(ip:string)=>Promise<boolean>;
  verifyChallenge:(token:string,ip:string)=>Promise<boolean>;
  save:(data:Intake)=>Promise<{receipt:string;replayed:boolean}>;
}
const services=['ویزا و اقامت','دعوتنامه و تجارت','پرواز و هتل','زیارت و کاروان','اسناد و کنسولی','خدمات مکمل سفر']
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const reply=(status:number,body:object)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
async function boundedJson(request:Request) {
  if(!request.body)throw new Error('empty')
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0
  try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();throw new Error('large')}chunks.push(value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))
}
export async function handleIntake(request:Request,ip:string,deps:Dependencies):Promise<Response> {
  if(!deps.enabled)return reply(503,{error:'intake_not_enabled'})
  if(request.method!=='POST')return reply(405,{error:'method_not_allowed'})
  if(new URL(request.url).protocol!=='https:' || request.headers.get('Origin')!==deps.origin)return reply(403,{error:'origin_denied'})
  if(request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return reply(415,{error:'json_required'})
  try {
    if(!ip || !await deps.rateLimit(ip))return reply(429,{error:'try_later'})
    let body:Record<string,unknown>
    try {body=await boundedJson(request)}catch{return reply(400,{error:'invalid_request'})}
    if(!body || typeof body!=='object' || Array.isArray(body))return reply(400,{error:'invalid_request'})
    const allowed=['requestId','service','destination','variant','contact','consent','challenge','website']
    if(Object.keys(body).some(key=>!allowed.includes(key)))return reply(400,{error:'unexpected_field'})
    const text=(key:string,max:number)=>typeof body[key]==='string' && (body[key] as string).length<=max && !/[\u0000-\u001f\u007f]/.test(body[key] as string)
    if(!text('requestId',36)||!uuid.test(body.requestId as string)||!text('service',50)||!services.includes(body.service as string)||!text('destination',80)||!(body.destination as string).trim()||!text('variant',120)||!text('contact',120)||!text('challenge',2048)||!(body.challenge as string).trim()||body.consent!==true||body.website!=='')return reply(400,{error:'invalid_request'})
    const contact=(body.contact as string).trim()
    if(contact.length<7)return reply(400,{error:'invalid_contact'})
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[0-9 ()-]{7,24}$/.test(contact))return reply(400,{error:'invalid_contact'})
    if(!await deps.verifyChallenge(body.challenge as string,ip))return reply(403,{error:'challenge_failed'})
    const result=await deps.save({requestId:body.requestId as string,service:body.service as string,destination:(body.destination as string).trim(),variant:(body.variant as string).trim(),contact,consent:true})
    if(!uuid.test(result.receipt))throw new Error('invalid receipt')
    return reply(result.replayed?200:201,{status:'received',receipt:result.receipt,replayed:result.replayed})
  }catch{return reply(503,{error:'temporarily_unavailable'})}
}
