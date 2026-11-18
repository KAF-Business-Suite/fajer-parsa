/**
 * FP-ADMIN-G7: existing KAF work items, exact Fajr scope, read only.
 * Reuses private Office encrypted cookie, current owner role and KAF's
 * authenticated RLS. Neither browser JWT nor Supabase service key is used.
 */
const PATH='/api/kaf/cases';
const SUPABASE='https://krzxajtrhvupyywovdzy.supabase.co';
const ROLE=SUPABASE+'/rest/v1/rpc/fajr_resource_owner_check';
const statuses=new Set(['جدید','در جریان','منتظر مدارک','تکمیل‌شده','لغوشده']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isText=(v,max)=>typeof v==='string'&&v.length<=max;
const date=(v)=>v===null||(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v));
function projectRow(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||
  !uuid.test(x.id)||!uuid.test(x.workspace_id)||x.company_key!=='fajr'||
  !isText(x.code,100)||!isText(x.title,300)||!statuses.has(x.status)||
  !date(x.due_date)||!isText(x.assigned_to,180)||!isText(x.next_action,1000)||
  !Number.isSafeInteger(x.revision)||x.revision<1||
  typeof x.updated_at!=='string'||!Number.isFinite(Date.parse(x.updated_at)))return null;
 return {id:x.id,workspaceId:x.workspace_id,company:'fajr',
  code:x.code,title:x.title,status:x.status,dueDate:x.due_date,
  assignedTo:x.assigned_to,nextAction:x.next_action,
  revision:x.revision,updatedAt:x.updated_at};
}
export async function handleKafCasesRead(request,env,services,transport=fetch){
 const url=new URL(request.url);
 if(url.pathname!==PATH)return null;
 if(request.method!=='GET')return services.err(405,'method_not_allowed');
 const params=url.searchParams;
 if([...params.keys()].some(k=>k!=='offset')||params.getAll('offset').length>1)
  return services.err(400,'invalid_request');
 const offset=params.get('offset')||'0';
 if(!/^(0|[1-9]\d{0,4})$/.test(offset)||Number(offset)>10000||Number(offset)%25!==0)
  return services.err(400,'invalid_request');
 if(!services.guard(request))return services.err(403,'forbidden');
 if(!env?.FAJR_SESSION_KEY)return services.err(503,'session_unavailable');
 try{
  const sealed=await services.parseSession(request,env);
  if(!sealed)return services.err(401,'sign_in_required',services.clearCookie());
  const publicKey=await services.publicKey(transport);
  const session=await services.restore(request,env,transport,publicKey,sealed);
  if(session.error)return services.err(session.error,session.error===401?'sign_in_required':'office_unavailable',
   session.error===401?services.clearCookie():null);
  const authorization='Bearer '+session.value.access;
  // Do not infer Fajr owner role from a JWT claim or the frontend route.
  const role=await transport(ROLE,{method:'POST',
   headers:{apikey:publicKey,Authorization:authorization,'Content-Type':'application/json',Accept:'application/json'},
   body:'{}',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(role.status===401)return services.err(401,'sign_in_required',services.clearCookie());
  if(role.status===403||role.status===400)return services.err(403,'access_denied');
  if(role.status!==200)return services.err(503,'case_auth_unavailable');
  if((await role.json().catch(()=>null))!==true)return services.err(403,'access_denied');
  // PostgREST evaluates KAF operations/view RLS under THIS user's token.
  // Never use a service-role key, never include RPC/RPC company from client.
  const select='id,workspace_id,company_key,code,title,status,due_date,assigned_to,next_action,revision,updated_at';
  const query=new URLSearchParams({
   select,company_key:'eq.fajr',order:'updated_at.desc,id.desc',limit:'25',offset});
  const source=SUPABASE+'/rest/v1/kaf_work_items?'+query.toString();
  const response=await transport(source,{method:'GET',
   headers:{apikey:publicKey,Authorization:authorization,Accept:'application/json'},
   redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(response.status===401)return services.err(401,'sign_in_required',services.clearCookie());
  if(response.status===403)return services.err(403,'access_denied');
  if(response.status===429)return services.err(429,'rate_limited');
  if(response.status!==200)return services.err(503,'case_unavailable');
  const body=await response.json().catch(()=>null);
  if(!Array.isArray(body)||body.length>25)return services.err(503,'case_invalid_response');
  const rows=body.map(projectRow);
  if(rows.some(x=>x===null))return services.err(503,'case_invalid_response');
  // Even a valid-looking unrelated row must NOT be displayed.
  return services.ok(rows,session.cookie);
 }catch{return services.err(503,'case_unavailable')}
}
