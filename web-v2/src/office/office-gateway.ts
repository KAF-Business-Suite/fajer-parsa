import type {OfficeCase,OfficeGateway} from './OfficeWorkspace'

// Reusable browser API adapter. Session ownership belongs to the existing KAF/Supabase
// authentication layer; this module never stores or parses tokens.
type TokenProvider=()=>Promise<string|null>
export function createOfficeGateway(getAccessToken:TokenProvider,fetcher:typeof fetch=fetch):OfficeGateway{
 const call=async (method:'GET'|'POST',path:string,payload?:unknown):Promise<unknown>=>{
  const token=await getAccessToken()
  if(!token||!token.trim())throw new Error('sign_in_required')
  const response=await fetcher('/api/office'+path,{
   method,mode:'same-origin',credentials:'omit',cache:'no-store',redirect:'error',
   headers:{Authorization:'Bearer '+token,'Accept':'application/json',...(payload?{'Content-Type':'application/json'}:{})},
   ...(payload?{body:JSON.stringify(payload)}:{})
  })
  if(!response.ok)throw new Error(response.status===401?'session_expired':response.status===403?'office_access_denied':response.status===409?'refresh_required':'office_unavailable')
  return await response.json()
 }
 return {
  list:async(offset:number)=>{
   if(!Number.isSafeInteger(offset)||offset<0||offset>999999)throw new Error('invalid_offset')
   return await call('GET','?offset='+offset) as OfficeCase[]
  },
  change:async(id,expected,status)=>{
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ||!(['received','reviewing','contacted','closed'] as string[]).includes(expected)
    ||!(['received','reviewing','contacted','closed'] as string[]).includes(status))throw new Error('invalid_change')
   return await call('POST','',{id,expected,status}) as {id:string;status:OfficeCase['status']}
  }
 }
}
