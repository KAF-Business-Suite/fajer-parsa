/**
 * FP-ADMIN-G6 — explicit, permissioned Office status change.
 * Existing same-origin encrypted-cookie BFF -> server role, CAS, quota, audit.
 * NEVER optimistic success: a POST must be followed by authoritative GET.
 */
import {readOfficeRequests} from './live-office-requests'
import type {OfficeRequestRow,OfficeStatus} from './live-office-requests'
const statuses:readonly OfficeStatus[]=['received','reviewing','contacted','closed']
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export type OfficeChangeResult=
 |{status:'verified';items:OfficeRequestRow[]}
 |{status:'invalid_request'|'conflict'|'sign_in_required'|'access_denied'|'rate_limited'|'unavailable'|'unverified';items:null}
export async function changeOfficeRequestStatus(
 row:Pick<OfficeRequestRow,'id'|'status'>,
 next:OfficeStatus,page:number,
 transport:typeof fetch=fetch
):Promise<OfficeChangeResult>{
 if(!uuid.test(row.id)||!statuses.includes(row.status)||!statuses.includes(next)||
    row.status===next||!Number.isSafeInteger(page)||page<0||page>39999)
  return{status:'invalid_request',items:null}
 let response:Response
 try{
  response=await transport('/api/office',{
   method:'POST',credentials:'same-origin',
   headers:{'X-FP-Office-Request':'same-origin','Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({id:row.id,expected:row.status,status:next}),
   cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)
  })
 }catch{return{status:'unverified',items:null}}
 if(response.status===401)return{status:'sign_in_required',items:null}
 if(response.status===403)return{status:'access_denied',items:null}
 if(response.status===409)return{status:'conflict',items:null}
 if(response.status===429)return{status:'rate_limited',items:null}
 if(response.status===400)return{status:'invalid_request',items:null}
 if(!response.ok)return{status:'unverified',items:null}
 let ack:unknown
 try{ack=await response.json()}catch{return{status:'unverified',items:null}}
 if(!ack||typeof ack!=='object'||Array.isArray(ack)||
   (ack as Record<string,unknown>).id!==row.id||
   (ack as Record<string,unknown>).status!==next)return{status:'unverified',items:null}
 // Use the normal permissioned Office read, never a second unaudited data path.
 const refreshed=await readOfficeRequests(page,transport)
 if(refreshed.status!=='ok')return{status:'unverified',items:null}
 const record=refreshed.items.find(item=>item.id===row.id)
 if(!record||record.status!==next)return{status:'unverified',items:null}
 return{status:'verified',items:refreshed.items}
}
