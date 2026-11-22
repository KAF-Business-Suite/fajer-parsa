// FP-SITE-CONTROL-01 — existing Office Worker API; no anonymous write or service-role.
const ENDPOINT='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_control';
const paths={
 '/api/site-settings/draft':{GET:'read',POST:'draft'},
 '/api/site-settings/preview':{POST:'preview'},
 '/api/site-settings/publish':{POST:'publish'},
 '/api/site-settings/rollback':{POST:'rollback'}
};
export async function handleSiteControl(request,env,services,transport=fetch){
 const pathname=new URL(request.url).pathname;
 const methods=paths[pathname];
 if(!methods)return null;
 const action=methods[request.method];
 if(!action)return services.err(405,'method_not_allowed');
 if(!services.guard(request))return services.err(403,'forbidden');
 if(!env?.FAJR_SESSION_KEY)return services.err(503,'session_unavailable');
 try{
  const sealed=await services.parseSession(request,env);
  if(!sealed)return services.err(401,'sign_in_required',services.clearCookie());
  const key=await services.publicKey(transport);
  const session=await services.restore(request,env,transport,key,sealed);
  if(session.error)return services.err(session.error,session.error===401?'sign_in_required':'office_unavailable',session.error===401?services.clearCookie():null);
  let payload={};
  if(request.method!=='GET'){
   payload=await services.limitedBody(request,16000);
   if(!payload||Object.keys(payload).some(x=>!['expected','draft','expectedPublished','targetRevision','confirmed'].includes(x)))
    return services.err(400,'invalid_request');
   if(action==='draft' && (typeof payload.expected!=='string'||!payload.draft||typeof payload.draft!=='object'||Array.isArray(payload.draft)))
    return services.err(400,'invalid_request');
   if(action==='publish' && (payload.confirmed!==true||typeof payload.expected!=='string'||typeof payload.expectedPublished!=='string'))
    return services.err(400,'invalid_request');
   if(action==='rollback' && (payload.confirmed!==true||typeof payload.targetRevision!=='string'||typeof payload.expectedPublished!=='string'))
    return services.err(400,'invalid_request');
   if(JSON.stringify(payload).length>14000)return services.err(413,'too_large');
  }
  // Reuse the existing atomic Office quota and active-member authorization for every write.
  // No second rate-limit store or customer data is returned to the settings screen.
  if(action!=='read'){
   if(typeof services.officeRequest!=='function')return services.err(503,'site_settings_unavailable');
   const quota=await services.officeRequest(transport,session.value.access);
   await quota.body?.cancel().catch(()=>{});
   if(!quota.ok){
    if(quota.status===401)return services.err(401,'sign_in_required',services.clearCookie());
    if(quota.status===403)return services.err(403,'access_denied');
    if(quota.status===429)return services.err(429,'rate_limited');
    return services.err(503,'site_settings_unavailable');
   }
  }
  const response=await transport(ENDPOINT,{
   method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.value.access,
    'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({p_action:action,p_payload:payload}),cache:'no-store',
   redirect:'manual',signal:AbortSignal.timeout(8000)
  });
  if(!response.ok){
   const error=await response.json().catch(()=>null);
   // Never expose database errors or privileged data in a public response.
   const code=String(error?.code||'');
   if(response.status===401)return services.err(401,'sign_in_required',services.clearCookie());
   if(response.status===403||code==='42501')return services.err(403,'access_denied');
   if(code==='40001')return services.err(409,'stale_revision');
   if(code==='22023')return services.err(400,'invalid_request');
   return services.err(503,'site_settings_unavailable');
  }
  const output=await response.text();
  if(output.length>30000)return services.err(503,'site_settings_unavailable');
  let data;try{data=JSON.parse(output)}catch{return services.err(503,'site_settings_unavailable')}
  if(!data||typeof data!=='object'||Array.isArray(data)||
   typeof data.draftRevision!=='string'||typeof data.canEdit!=='boolean')return services.err(503,'site_settings_unavailable');
  return services.ok(data,session.cookie);
 }catch{return services.err(503,'site_settings_unavailable')}
}
