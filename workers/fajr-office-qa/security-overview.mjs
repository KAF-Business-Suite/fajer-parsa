/**
 * KAF-35 / FP-SEC-01 — private, read-only identity posture.
 * Existing encrypted HttpOnly BFF, verified Supabase user and live owner RPC
 * remain the only sources of truth. Never send access/refresh tokens to JS.
 * No new login method is enabled by this endpoint.
 */
const PROVIDERS=new Set(['email','google','github','azure']);
export function sanitizeSecuritySummary(user,session){
 if(!user||typeof user!=='object'||typeof user.id!=='string'||user.role!=='authenticated')
  throw Error('invalid_identity');
 if(!session||!Number.isFinite(session.until)||session.until<=Date.now()/1000)
  throw Error('expired_session');
 const identities=Array.isArray(user.identities)?user.identities:[];
 const linkedProviders=[...new Set(identities.map(i=>i?.provider).filter(p=>typeof p==='string'&&PROVIDERS.has(p)))].sort();
 const factors=Array.isArray(user.factors)?user.factors:null;
 const verifiedTotp=factors?.some(f=>f?.factor_type==='totp'&&f?.status==='verified')||false;
 const expiry=new Date(session.until*1000);
 if(!Number.isFinite(expiry.getTime()))throw Error('invalid_expiry');
 return {
  scope:'fajr_owner_console',
  session:{remember:session.remember===true,expiresAt:expiry.toISOString()},
  emailVerification:typeof user.email_confirmed_at==='string'?'verified':user.email_confirmed_at===null?'not_verified':'unknown',
  totp:verifiedTotp?'enabled':factors?'not_enrolled':'unknown',
  linkedProviders
 };
}
export async function handleSecurityOverview(request,env,services,transport=fetch){
 const url=new URL(request.url);
 if(url.pathname!=='/api/security/overview')return null;
 const {err,ok,guard,parseSession,publicKey,restore,clearCookie,ownerRpc}=services;
 if(request.method!=='GET')return err(405,'method_not_allowed');
 if(url.search)return err(400,'invalid_request');
 if(!guard(request))return err(403,'forbidden');
 if(!env?.FAJR_SESSION_KEY)return err(503,'session_unavailable');
 const sealed=await parseSession(request,env);
 if(!sealed)return err(401,'sign_in_required',clearCookie());
 try{
  const key=await publicKey(transport);
  const auth=await restore(request,env,transport,key,sealed);
  if(auth.error)return err(auth.error,auth.error===401?'sign_in_required':'security_unavailable',auth.error===401?clearCookie():undefined);
  // This owner role is checked LIVE; current personal auth alone is insufficient.
  const role=await transport(ownerRpc,{
   method:'POST',headers:{apikey:key,Authorization:'Bearer '+auth.value.access,
    'Content-Type':'application/json',Accept:'application/json'},
   body:'{}',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(8000)
  });
  if(!role.ok){
   if(role.status===401)return err(401,'sign_in_required',clearCookie());
   if(role.status===403||role.status===400)return err(403,'access_denied');
   return err(503,'security_unavailable');
  }
  if((await role.json().catch(()=>null))!==true)return err(403,'access_denied');
  return ok(sanitizeSecuritySummary(auth.user,auth.value),auth.cookie);
 }catch{return err(503,'security_unavailable')}
}
