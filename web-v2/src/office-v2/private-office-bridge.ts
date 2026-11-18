/**
 * Private Fajr Office console bridge — browser-side metadata only.
 * Existing HttpOnly cookie stays on private Office Worker, never in React.
 * This route never runs on the public, synthetic Pages design preview.
 */
export type OwnerPagesMetadata={
 id:string;provider:'cloudflare_pages';name:'fajr-parsa-qa';url:string;
 productionBranch:string;permission:'read-only';ownerVerified:true;
 allowedActions:['inspect'];lastVerifiedAt:string
}
export const PRIVATE_OFFICE_HOST='fajr-office-qa.khoojafahim.workers.dev'
export const PRIVATE_PAGES_PATH='/api/resources/providers/cloudflare/fajr-parsa-qa'
export function isPrivateOfficeConsole(locationLike:{hostname:string;pathname:string}):boolean{
 return locationLike.hostname===PRIVATE_OFFICE_HOST && locationLike.pathname==='/console'
}
export type ReadResult={status:'connected';data:OwnerPagesMetadata}|{status:'sign_in_required'|'access_denied'|'unavailable';data:null}
export async function readOwnerPagesMetadata(transport:typeof fetch=fetch):Promise<ReadResult>{
 try{
  const response=await transport(PRIVATE_PAGES_PATH,{
   method:'GET',
   credentials:'same-origin',
   headers:{'X-FP-Office-Request':'same-origin',Accept:'application/json'},
   cache:'no-store',
   redirect:'error',
   signal:AbortSignal.timeout(10000),
  })
  if(response.status===401)return{status:'sign_in_required',data:null}
  if(response.status===403)return{status:'access_denied',data:null}
  if(!response.ok)return{status:'unavailable',data:null}
  const value:unknown=await response.json()
  if(!value||typeof value!=='object')return{status:'unavailable',data:null}
  const x=value as Record<string,unknown>
  if(x.id!=='cloudflare-pages/fajr-parsa-qa'||x.provider!=='cloudflare_pages'||
    x.name!=='fajr-parsa-qa'||x.url!=='https://fajr-parsa-qa.pages.dev'||
    x.permission!=='read-only'||x.ownerVerified!==true||
    !Array.isArray(x.allowedActions)||x.allowedActions.length!==1||x.allowedActions[0]!=='inspect'||
    typeof x.productionBranch!=='string'||typeof x.lastVerifiedAt!=='string')
   return{status:'unavailable',data:null}
  return{status:'connected',data:x as OwnerPagesMetadata}
 }catch{return{status:'unavailable',data:null}}
}
