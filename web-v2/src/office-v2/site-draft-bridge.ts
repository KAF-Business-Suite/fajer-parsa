/**
 * KAF-35 Unified Admin — owner-only website draft bridge.
 * EXISTING Cloudflare Office same-origin HttpOnly BFF and Supabase CAS/audit own writes.
 * Browser code never receives a service key, staff JWT or customer records.
 * Only the documented public-site configuration fields are editable.
 */
export const siteLanguages=['fa','ps','en','ar'] as const
export type SiteLanguage=typeof siteLanguages[number]
export type SiteTexts=Record<SiteLanguage,string>
export type SiteFaq={question:SiteTexts;answer:SiteTexts}
export type SiteDraft={
 contact:{whatsapp:string;email:string;phone?:string;mapUrl?:string};
 office:{address:SiteTexts;hours:SiteTexts};
 design:{fontPreset:'vazirmatn-manrope'|'estedad-inter'};
 content:{notice:SiteTexts;faq:SiteFaq[]}
}
export type SiteDraftState={
 draftRevision:string;publishedRevision:string|null;
 canEdit:boolean;canPublish:boolean;draft:SiteDraft
}
export type SiteDraftResult=
 |{status:'ready';data:SiteDraftState}
 |{status:'sign_in_required'|'access_denied'|'rate_limited'|'conflict'|'invalid'|'unavailable';data:null}
export type SiteWriteResult=
 |{status:'verified';data:SiteDraftState}
 |{status:'access_denied'|'sign_in_required'|'rate_limited'|'conflict'|'invalid'|'unavailable'|'unverified';data:null}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const revision=(v:unknown)=>typeof v==='string'&&v.length>0&&v.length<=100&&/^[a-zA-Z0-9._-]+$/.test(v)
const text=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max?v:null
const translations=(v:unknown,max:number):SiteTexts|null=>{
 if(!record(v))return null
 const values=siteLanguages.map(k=>text(v[k],max))
 return values.every(x=>x!==null)?Object.fromEntries(siteLanguages.map((k,i)=>[k,values[i]])) as SiteTexts:null
}
export function parseSiteDraftState(value:unknown):SiteDraftState|null{
 if(!record(value)||!revision(value.draftRevision)||
   (value.publishedRevision!==null&&value.publishedRevision!==undefined&&!revision(value.publishedRevision))||
   typeof value.canEdit!=='boolean'||typeof value.canPublish!=='boolean'||!record(value.draft))return null
 const d=value.draft
 if(!record(d.contact)||!record(d.office)||!record(d.content)||!record(d.design))return null
 const whatsapp=text(d.contact.whatsapp,18),email=text(d.contact.email,254),
       phone=d.contact.phone===undefined?'':text(d.contact.phone,18),
       mapUrl=d.contact.mapUrl===undefined?'':text(d.contact.mapUrl,350)
 const address=translations(d.office.address,300),hours=translations(d.office.hours,120),
       notice=translations(d.content.notice,500)
 if(whatsapp===null||email===null||phone===null||mapUrl===null||!address||!hours||!notice)return null
 if(d.design.fontPreset!=='vazirmatn-manrope'&&d.design.fontPreset!=='estedad-inter')return null
 if(!Array.isArray(d.content.faq)||d.content.faq.length>5)return null
 const faqs:SiteFaq[]=[]
 for(const item of d.content.faq){
  if(!record(item))return null
  const question=translations(item.question,180),answer=translations(item.answer,600)
  if(!question||!answer)return null
  faqs.push({question,answer})
 }
 return {
  draftRevision:value.draftRevision as string,
  publishedRevision:typeof value.publishedRevision==='string'?value.publishedRevision:null,
  canEdit:value.canEdit,canPublish:value.canPublish,
  draft:{contact:{whatsapp,email,...(phone?{phone}:{}),...(mapUrl?{mapUrl}:{})},
   office:{address,hours},design:{fontPreset:d.design.fontPreset},
   content:{notice,faq:faqs}}
 }
}
const normalizeNumber=(value:string,whatsapp=false)=>{
 let n=value.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776))
             .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632))
             .trim().replace(/[ ()-]/g,'')
 if(/^07[0-9]{8}$/.test(n))n='93'+n.slice(1)
 else if(/^0093[0-9]{9}$/.test(n))n=n.slice(2)
 if(!n)return ''
 if(whatsapp)return n.startsWith('+')?n.slice(1):n
 return n.startsWith('+')?n:'+'+n
}
const validMap=(value:string)=>{
 if(!value)return true
 try{const url=new URL(value)
  if(url.protocol!=='https:'||url.username||url.password)return false
  if(url.hostname==='maps.app.goo.gl')return /^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
  if(['www.google.com','google.com','maps.google.com'].includes(url.hostname))return url.pathname.startsWith('/maps')
  return url.hostname==='www.openstreetmap.org'&&url.pathname.startsWith('/')
 }catch{return false}
}
export function cleanSiteDraft(draft:SiteDraft):{draft:SiteDraft|null;error:string|null}{
 const checked=parseSiteDraftState({draftRevision:'valid',publishedRevision:null,canEdit:true,canPublish:false,draft})
 if(!checked)return {draft:null,error:'invalid_data'}
 const data=structuredClone(checked.draft)
 data.contact.whatsapp=normalizeNumber(data.contact.whatsapp,true)
 if(data.contact.phone)data.contact.phone=normalizeNumber(data.contact.phone)
 else delete data.contact.phone
 if(!data.contact.mapUrl)delete data.contact.mapUrl
 if(data.contact.whatsapp&&!/^[1-9][0-9]{6,14}$/.test(data.contact.whatsapp))return{draft:null,error:'invalid_number'}
 if(data.contact.phone&&!/^\+?[1-9][0-9]{6,14}$/.test(data.contact.phone))return{draft:null,error:'invalid_number'}
 if(data.contact.email&&!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/.test(data.contact.email))return{draft:null,error:'invalid_email'}
 if(!validMap(data.contact.mapUrl||''))return{draft:null,error:'invalid_map'}
 return{draft:data,error:null}
}
const options=(method:'GET'|'POST',body?:unknown):RequestInit=>({
 method,credentials:'same-origin',redirect:'error',cache:'no-store',
 headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json',...(method==='POST'?{'Content-Type':'application/json'}:{})},
 ...(method==='POST'?{body:JSON.stringify(body)}:{}),
 signal:AbortSignal.timeout(10000)
})
const statusCode=(code:number):Exclude<SiteDraftResult['status'],'ready'>=>(
 code===401?'sign_in_required':code===403?'access_denied':code===429?'rate_limited':
 code===409?'conflict':code===400?'invalid':'unavailable'
)
export async function readSiteDraft(transport:typeof fetch=fetch):Promise<SiteDraftResult>{
 try{
  const res=await transport('/api/site-settings/draft',options('GET'))
  if(!res.ok)return{status:statusCode(res.status),data:null}
  const state=parseSiteDraftState(await res.json())
  return state?{status:'ready',data:state}:{status:'unavailable',data:null}
 }catch{return{status:'unavailable',data:null}}
}
export async function saveSiteDraft(
 current:SiteDraftState,proposed:SiteDraft,transport:typeof fetch=fetch
):Promise<SiteWriteResult>{
 if(!current.canEdit)return{status:'access_denied',data:null}
 const checked=cleanSiteDraft(proposed)
 if(!checked.draft||!revision(current.draftRevision))return{status:'invalid',data:null}
 let result:Response
 try{result=await transport('/api/site-settings/draft',options('POST',{expected:current.draftRevision,draft:checked.draft}))}
 catch{return{status:'unverified',data:null}}
 if(!result.ok)return{status:statusCode(result.status),data:null}
 const refresh=await readSiteDraft(transport)
 if(refresh.status!=='ready')return{status:'unverified',data:null}
 // After a server acknowledgement, verify the new authoritative values, never
 // claim a saved draft on an optimistic response or an unchanged server snapshot.
 const same=JSON.stringify(refresh.data.draft)===JSON.stringify(checked.draft)
 if(!same)return{status:'unverified',data:null}
 return{status:'verified',data:refresh.data}
}
