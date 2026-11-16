import {parsePublishedSiteSettings,type PublishedSiteSettings} from './site-settings-contract'

let cache:{at:number;result:Promise<PublishedSiteSettings|null>}|null=null
/** One same-origin read of published public configuration, never draft/private fields.
 * If the API is not deployed, existing verified contact defaults remain in use. */
export function loadPublishedSiteSettings():Promise<PublishedSiteSettings|null>{
 if(typeof window==='undefined')return Promise.resolve(null)
 if(cache&&Date.now()-cache.at<60_000)return cache.result
 const result=(async()=>{
  try{
   const response=await fetch('/api/site-settings/public',{
    method:'GET',headers:{Accept:'application/json'},redirect:'error',
    credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(4000)
   })
   if(!response.ok||!(response.headers.get('content-type')||'').includes('application/json'))return null
   if(Number(response.headers.get('content-length')||0)>8192)return null
   const raw=await response.text()
   if(raw.length>8192)return null
   return parsePublishedSiteSettings(JSON.parse(raw))
  }catch{return null}
 })()
 cache={at:Date.now(),result}
 return result
}
