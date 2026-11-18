/** Private owner account security summary: read-only, no secrets or browser-stored tokens. */
export type SecurityOverview={
 scope:'fajr_owner_console';
 emailVerification:'verified'|'not_verified'|'unknown';
 totp:'enabled'|'not_enrolled'|'unknown';
 linkedProviders:('email'|'google'|'github'|'azure')[];
 session:{remember:boolean;expiresAt:string}
}
export type SecurityReadResult=
 |{status:'ready';data:SecurityOverview}
 |{status:'sign_in_required'|'access_denied'|'rate_limited'|'unavailable';data:null}
const providers=new Set(['email','google','github','azure'])
export function parseSecurityOverview(input:unknown):SecurityOverview|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null
 const v=input as Record<string,unknown>
 if(v.scope!=='fajr_owner_console')return null
 if(!['verified','not_verified','unknown'].includes(String(v.emailVerification)))return null
 if(!['enabled','not_enrolled','unknown'].includes(String(v.totp)))return null
 if(!Array.isArray(v.linkedProviders)||v.linkedProviders.length>4||
   v.linkedProviders.some(x=>typeof x!=='string'||!providers.has(x))||
   new Set(v.linkedProviders).size!==v.linkedProviders.length)return null
 const s=v.session
 if(!s||typeof s!=='object'||Array.isArray(s))return null
 const session=s as Record<string,unknown>
 if(typeof session.remember!=='boolean'||typeof session.expiresAt!=='string'||
   !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(session.expiresAt)||
   !Number.isFinite(Date.parse(session.expiresAt)))return null
 return{
  scope:'fajr_owner_console',
  emailVerification:v.emailVerification as SecurityOverview['emailVerification'],
  totp:v.totp as SecurityOverview['totp'],
  linkedProviders:[...v.linkedProviders],
  session:{remember:session.remember,expiresAt:session.expiresAt}
 }
}
export async function readSecurityOverview(transport:typeof fetch=fetch):Promise<SecurityReadResult>{
 try{
  const response=await transport('/api/security/overview',{
   method:'GET',credentials:'same-origin',
   headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json'},
   redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)
  })
  if(response.status===401)return{status:'sign_in_required',data:null}
  if(response.status===403)return{status:'access_denied',data:null}
  if(response.status===429)return{status:'rate_limited',data:null}
  if(!response.ok)return{status:'unavailable',data:null}
  const parsed=parseSecurityOverview(await response.json())
  return parsed?{status:'ready',data:parsed}:{status:'unavailable',data:null}
 }catch{return{status:'unavailable',data:null}}
}
