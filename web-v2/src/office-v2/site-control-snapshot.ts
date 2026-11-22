/**
 * FP-ADMIN-G5: read-only site-control snapshot from the EXISTING Office BFF.
 * No provider tokens, no config JSON dumps, no writes, no direct Supabase key.
 */
export type SiteControlSnapshot={
 draftRevision:string|null;publishedRevision:string|null;canEdit:boolean;canPublish:boolean
}
export type SiteReadResult=
 |{status:'ready';data:SiteControlSnapshot}
 |{status:'sign_in_required'|'access_denied'|'rate_limited'|'unavailable';data:null}
const revision=(value:unknown):string|null|undefined=>{
 if(value===null||value==='')return null
 if(typeof value!=='string'||value.length>100||value.length<1||!/^[a-zA-Z0-9._-]+$/.test(value))return undefined
 return value
}
export function parseSiteControlSnapshot(value:unknown):SiteControlSnapshot|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null
 const x=value as Record<string,unknown>
 const draft=revision(x.draftRevision)
 const published=revision(x.publishedRevision)
 if(draft===undefined||published===undefined||typeof x.canEdit!=='boolean'||typeof x.canPublish!=='boolean')return null
 return{draftRevision:draft,publishedRevision:published,canEdit:x.canEdit,canPublish:x.canPublish}
}
export async function readSiteControlSnapshot(transport:typeof fetch=fetch):Promise<SiteReadResult>{
 try{
  const response=await transport('/api/site-settings/draft',{
   method:'GET',credentials:'same-origin',headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json'},
   redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)
  })
  if(response.status===401)return{status:'sign_in_required',data:null}
  if(response.status===403)return{status:'access_denied',data:null}
  if(response.status===429)return{status:'rate_limited',data:null}
  if(!response.ok)return{status:'unavailable',data:null}
  const data=parseSiteControlSnapshot(await response.json())
  return data?{status:'ready',data}:{status:'unavailable',data:null}
 }catch{return{status:'unavailable',data:null}}
}
