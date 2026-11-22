/**
 * Fajr Office G7: only data returned by the secured, same-origin KAF BFF.
 * User JWT never reaches browser storage or this code.
 */
export type KafCase={
 id:string;workspaceId:string;company:'fajr';code:string;title:string;
 status:'جدید'|'در جریان'|'منتظر مدارک'|'تکمیل‌شده'|'لغوشده';
 dueDate:string|null;assignedTo:string;nextAction:string;revision:number;updatedAt:string
}
export type KafCasesResult=
 |{status:'ok';items:KafCase[]}
 |{status:'sign_in_required'|'access_denied'|'rate_limited'|'unavailable';items:[]}
const allowed=new Set(['جدید','در جریان','منتظر مدارک','تکمیل‌شده','لغوشده'])
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const text=(x:unknown,n:number):x is string=>typeof x==='string'&&x.length<=n
export function parseKafCases(value:unknown):KafCase[]|null{
 if(!Array.isArray(value)||value.length>25)return null
 const out:KafCase[]=[]
 for(const raw of value){
  if(raw===null||typeof raw!=='object'||Array.isArray(raw))return null
  const r=raw as Record<string,unknown>
  if(!text(r.id,36)||!uuid.test(r.id)||!text(r.workspaceId,36)||!uuid.test(r.workspaceId)||
   r.company!=='fajr'||!text(r.code,100)||!text(r.title,300)||
   typeof r.status!=='string'||!allowed.has(r.status)||
   !(r.dueDate===null||(text(r.dueDate,10)&&/^\d{4}-\d\d-\d\d$/.test(r.dueDate)))||
   !text(r.assignedTo,180)||!text(r.nextAction,1000)||
   !Number.isSafeInteger(r.revision)||Number(r.revision)<1||
   !text(r.updatedAt,60)||!Number.isFinite(Date.parse(r.updatedAt)))return null
  out.push({
   id:r.id,workspaceId:r.workspaceId,company:'fajr',
   code:r.code,title:r.title,status:r.status as KafCase['status'],
   dueDate:r.dueDate as string|null,assignedTo:r.assignedTo,nextAction:r.nextAction,
   revision:r.revision as number,updatedAt:r.updatedAt
  })
 }
 return out
}
export async function readKafCases(page:number,transport:typeof fetch=fetch):Promise<KafCasesResult>{
 if(!Number.isSafeInteger(page)||page<0||page>400)return{status:'unavailable',items:[]}
 try{
  const r=await transport('/api/kaf/cases?offset='+String(page*25),{
   method:'GET',credentials:'same-origin',
   headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json'},
   cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)
  })
  if(r.status===401)return{status:'sign_in_required',items:[]}
  if(r.status===403)return{status:'access_denied',items:[]}
  if(r.status===429)return{status:'rate_limited',items:[]}
  if(!r.ok)return{status:'unavailable',items:[]}
  const data=parseKafCases(await r.json())
  return data?{status:'ok',items:data}:{status:'unavailable',items:[]}
 }catch{return{status:'unavailable',items:[]}}
}
