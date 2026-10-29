import type { Intake } from './handler.ts'
// All configuration here belongs to server secrets/bindings, never VITE_* variables.
export function turnstileVerifier(secret:string,hostname:string,fetcher:typeof fetch=fetch) {
  return async(token:string,ip:string)=>{
    const response=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token,remoteip:ip}),signal:AbortSignal.timeout(5000)})
    if(!response.ok)return false
    const data=await response.json() as {success?:boolean;hostname?:string;action?:string}
    return data.success===true&&data.hostname===hostname&&data.action==='fajr_intake'
  }
}
export function supabaseSaver(projectUrl:string,serverKey:string,fetcher:typeof fetch=fetch) {
  const url=new URL('/rest/v1/rpc/fajr_receive_web_request',projectUrl)
  if(url.protocol!=='https:' || !url.hostname.endsWith('.supabase.co'))throw new Error('invalid server database URL')
  return async(data:Intake)=>{
    const response=await fetcher(url,{method:'POST',headers:{apikey:serverKey,Authorization:'Bearer '+serverKey,'Content-Type':'application/json'},body:JSON.stringify({payload:{request_id:data.requestId,service:data.service,destination:data.destination,variant:data.variant,contact:data.contact,consent:data.consent}}),signal:AbortSignal.timeout(8000)})
    if(!response.ok)throw new Error('store unavailable')
    const rows=await response.json() as {receipt:string;replayed:boolean}[]
    if(rows.length!==1 || typeof rows[0].replayed!=='boolean')throw new Error('invalid store response')
    return rows[0]
  }
}
