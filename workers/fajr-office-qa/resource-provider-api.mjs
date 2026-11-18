/**
 * KAF-35 G2 | First permissioned provider probe (OFF by default).
 * Exact QA Pages project only. No incoming URL/account/project arguments.
 * No browser tokens, no writes, no modification of the real provider project.
 *
 * All requests must pass the canonical encrypted-cookie Office session, then
 * the existing Fajr site-control owner/editor permission gate. Future assets
 * require their own workspace/role scope; do not generalize this endpoint to
 * KAF, personal, or another company's resources.
 */
const PROJECT='fajr-parsa-qa';
const PATH='/api/resources/providers/cloudflare/fajr-parsa-qa';
const OWNER_AUTHZ='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_resource_owner_check';
const API_ORIGIN='https://api.cloudflare.com';

const validAccountId=(id)=>typeof id==='string'&&/^[0-9a-f]{32}$/.test(id);
const validToken=(value)=>typeof value==='string'&&value.trim().length>=16&&value.length<=2048&&!/[\r\n]/.test(value);

export async function handleFajrPagesRead(request,env,services,transport=fetch){
 const {pathname,search}=new URL(request.url);
 if(pathname!==PATH)return null;
 if(request.method!=='GET')return services.err(405,'method_not_allowed');
 if(search)return services.err(400,'invalid_request');
 if(!services.guard(request))return services.err(403,'forbidden');
 if(!env?.FAJR_SESSION_KEY)return services.err(503,'session_unavailable');
 try{
  const sealed=await services.parseSession(request,env);
  if(!sealed)return services.err(401,'sign_in_required',services.clearCookie());
  const publicKey=await services.publicKey(transport);
  const session=await services.restore(request,env,transport,publicKey,sealed);
  if(session.error)return services.err(session.error,session.error===401?'sign_in_required':'office_unavailable',
   session.error===401?services.clearCookie():null);
  // Dedicated read-only SQL RPC enforces active Fajr membership and the CURRENT
  // business_members.role='owner' on every call, not just a stale publish flag.
  const role=await transport(OWNER_AUTHZ,{
   method:'POST',
   headers:{apikey:publicKey,Authorization:'Bearer '+session.value.access,'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({}),
   redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000)
  });
  if(!role.ok){
   if(role.status===401)return services.err(401,'sign_in_required',services.clearCookie());
   if(role.status===403||role.status===400)return services.err(403,'access_denied');
   return services.err(503,'resource_auth_unavailable');
  }
  const isCurrentOwner=await role.json().catch(()=>null);
  if(isCurrentOwner!==true)return services.err(403,'access_denied');
  // Owner role is established; the API stays closed until a dedicated,
  // server-side Pages READ token + account ID are provisioned by an operator.
  if(!validAccountId(env?.FAJR_CLOUDFLARE_ACCOUNT_ID)||!validToken(env?.FAJR_CLOUDFLARE_READ_TOKEN))
   return services.err(503,'provider_not_configured');
  const url=API_ORIGIN+'/client/v4/accounts/'+env.FAJR_CLOUDFLARE_ACCOUNT_ID+'/pages/projects/'+PROJECT;
  const upstream=await transport(url,{
   method:'GET',
   headers:{Authorization:'Bearer '+env.FAJR_CLOUDFLARE_READ_TOKEN,Accept:'application/json'},
   redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000)
  });
  if(!upstream.ok||upstream.status!==200)return services.err(503,'provider_unavailable');
  const result=await upstream.json().catch(()=>null);
  const project=result?.result;
  if(result?.success!==true||!project||project.name!==PROJECT||
     project.subdomain!=='fajr-parsa-qa.pages.dev'||
     typeof project.production_branch!=='string'||project.production_branch.length>100)
   return services.err(503,'provider_invalid_response');
  // No operator/API token, internal account ID, deployment metadata,
  // unrelated project listing, or writable capability leaves the Worker.
  return services.ok({
   id:'cloudflare-pages/fajr-parsa-qa',
   provider:'cloudflare_pages',
   name:PROJECT,
   url:'https://fajr-parsa-qa.pages.dev',
   productionBranch:project.production_branch,
   permission:'read-only',
   ownerVerified:true,
   allowedActions:['inspect'],
   lastVerifiedAt:new Date().toISOString()
  },session.cookie);
 }catch{return services.err(503,'provider_unavailable')}
}
