/**
 * KAF-35 G3: read-only Office request data via the existing same-origin BFF.
 * Called ONLY from the authenticated QA console route. The browser never
 * receives the Office bearer/refresh token or a privileged Supabase key.
 * No localStorage, sessionStorage, polling, or POST writes.
 */
export type OfficeStatus='received'|'reviewing'|'contacted'|'closed'
export type OfficeRequestRow={
 id:string;service:string;destination:string;contact:string;status:OfficeStatus
}
export type OfficeRequestResult=
 |{status:'ok';items:OfficeRequestRow[]}
 |{status:'sign_in_required'|'access_denied'|'rate_limited'|'unavailable';items:[]}
const statuses=new Set(['received','reviewing','contacted','closed'])
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function text(value:unknown,max=250):string{
 return typeof value==='string'&&value.length<=max?value:''
}
export function parseOfficeRows(value:unknown):OfficeRequestRow[]|null{
 if(!Array.isArray(value)||value.length>25)return null
 const output:OfficeRequestRow[]=[]
 for(const raw of value){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null
  const r=raw as Record<string,unknown>
  if(typeof r.id!=='string'||!uuid.test(r.id)||typeof r.status!=='string'||!statuses.has(r.status))return null
  output.push({id:r.id,status:r.status as OfficeStatus,
   service:text(r.service),destination:text(r.destination),contact:text(r.contact,320)})
 }
 return output
}
export async function readOfficeRequests(page:number,transport:typeof fetch=fetch):Promise<OfficeRequestResult>{
 if(!Number.isSafeInteger(page)||page<0||page>39999)return{status:'unavailable',items:[]}
 try{
  const response=await transport('/api/office?offset='+String(page*25),{
   method:'GET',credentials:'same-origin',
   headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json'},
   cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),
  })
  if(response.status===401)return{status:'sign_in_required',items:[]}
  if(response.status===403)return{status:'access_denied',items:[]}
  if(response.status===429)return{status:'rate_limited',items:[]}
  if(!response.ok)return{status:'unavailable',items:[]}
  const parsed=parseOfficeRows(await response.json())
  return parsed?{status:'ok',items:parsed}:{status:'unavailable',items:[]}
 }catch{return{status:'unavailable',items:[]}}
}
