/**
 * KAF-ORIGIN-01 — Independent KAF Admin front door (QA until owner acceptance).
 *
 * This Worker is a separate Cloudflare service at kaf-admin.*.workers.dev.
 * Auth and permission checks use an explicit service binding to the existing
 * Fajr owner BFF; no staff keys, identities, or JWTs are copied to this Worker.
 * Real tenant switching is not supported until company-level RBAC is verified.
 */
export const KAF_ENTRY_HOST='kaf-admin.khoojafahim.workers.dev';
export const KAF_ENTRY_ORIGIN='https://'+KAF_ENTRY_HOST;
export const VERIFIED_BFF_ORIGIN='https://fajr-office-qa.khoojafahim.workers.dev';
// This immutable QA bundle must be advanced only after independent GitHub CI.
export const PINNED_KAF_PAGES_ORIGIN='https://7d0113f4.fajr-parsa-qa.pages.dev';
const CSP="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self' https://krzxajtrhvupyywovdzy.supabase.co; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'";
const baseSecurity={'Content-Security-Policy':CSP,'Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Cross-Origin-Resource-Policy':'same-origin'};
const assets=/^\/assets\/[A-Za-z0-9._-]{1,180}\.(?:js|css|woff2|svg|png|webp|ico)$/;
const api=/^\/api\/[A-Za-z0-9_./-]{1,140}$/;
const mime={js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',woff2:'font/woff2',svg:'image/svg+xml',png:'image/png',webp:'image/webp',ico:'image/x-icon'};
function outputHeaders(type='text/plain; charset=utf-8',cookie=null){
 const h=new Headers({...baseSecurity,'Content-Type':type});
 if(cookie)h.set('Set-Cookie',cookie);
 return h;
}
const fail=(status)=>new Response(status===404?'Not Found':'KAF Admin temporarily unavailable',{status,headers:outputHeaders()});
function isFromKaf(request){
 const origin=request.headers.get('Origin');
 const fetchSite=request.headers.get('Sec-Fetch-Site');
 return (!origin||origin===KAF_ENTRY_ORIGIN) && (!fetchSite||fetchSite==='same-origin'||fetchSite==='none');
}
function proxyRequest(request,path,forceMethod=null){
 const headers=new Headers(request.headers);
 headers.delete('Host');headers.delete('Referer');
 headers.delete('X-Forwarded-Host');headers.delete('X-Forwarded-Proto');
 headers.delete('Forwarded');headers.delete('CF-Connecting-IP');
 if(request.method!=='GET')headers.set('Origin',VERIFIED_BFF_ORIGIN);
 else headers.delete('Origin');
 const method=forceMethod||request.method;
 return new Request(VERIFIED_BFF_ORIGIN+path,{
  method,headers,redirect:'manual',cache:'no-store',
  ...(method==='POST'?{body:request.body}:{}),
 });
}
async function forwardToBff(env,request,path){
 const service=env?.KAF_OWNER_BFF;
 if(!service||typeof service.fetch!=='function')return fail(503);
 try{
  const response=await service.fetch(proxyRequest(request,path));
  // Never pass a redirect to an uncontrolled host through the entry Worker.
  if(response.status>=300&&response.status<400){
   const target=response.headers.get('Location')||'';
   if(!target.startsWith('/')||target.startsWith('//'))return fail(502);
  }
  const head=new Headers(response.headers);
  head.set('Cache-Control','private, no-store');
  head.set('X-Robots-Tag','noindex, nofollow');
  head.set('X-Content-Type-Options','nosniff');
  return new Response(response.body,{status:response.status,headers:head});
 }catch{return fail(503)}
}
async function authorize(env,cookie){
 try{
  const response=await env.KAF_OWNER_BFF.fetch(new Request(VERIFIED_BFF_ORIGIN+'/api/session',{
   method:'GET',redirect:'manual',cache:'no-store',
   headers:{Cookie:cookie,'X-FP-Office-Request':'same-origin',Accept:'application/json'}
  }));
  if(response.status!==200)return{status:response.status===401?401:response.status===403?403:503,cookie:response.headers.get('Set-Cookie')};
  const body=await response.json();
  if(body?.authenticated!==true||body?.scope!=='fajr_owner_console')return{status:403};
  return{status:200,cookie:response.headers.get('Set-Cookie')};
 }catch{return{status:503}}
}
async function pinnedFile(path,transport){
 try{
  const r=await transport(PINNED_KAF_PAGES_ORIGIN+path,{
   method:'GET',headers:{Accept:'*/*'},redirect:'manual',cache:'no-store',
   signal:AbortSignal.timeout(9000)
  });
  if(r.status!==200||!r.ok||(Number(r.headers.get('Content-Length')||0)>8_000_000))return null;
  return r;
 }catch{return null}
}
export async function handleAdminRequest(request,env,pagesTransport=fetch){
 const url=new URL(request.url);
 if(url.protocol!=='https:'||url.hostname!==KAF_ENTRY_HOST)return fail(403);
 if(!isFromKaf(request))return fail(403);
 if(url.pathname==='/'&&request.method==='GET')return new Response(null,{status:302,headers:{...baseSecurity,Location:'/console'}});
 if(url.pathname==='/'||request.method!=='GET'&&request.method!=='POST')return fail(405);
 if(request.method==='POST'&&request.headers.get('Origin')!==KAF_ENTRY_ORIGIN)return fail(403);
 if(url.pathname==='/console'){
  if(request.method!=='GET')return fail(405);
  const cookie=request.headers.get('Cookie')||'';
  if(url.searchParams.get('mode')==='recovery'||!cookie.includes('__Host-fp-office-session=')){
   return forwardToBff(env,request,'/console'+url.search);
  }
  if(!env?.KAF_OWNER_BFF)return fail(503);
  const access=await authorize(env,cookie);
  if(access.status===401)return forwardToBff(env,request,'/console'+url.search);
  if(access.status!==200)return fail(access.status);
  const page=await pinnedFile('/office-preview',pagesTransport);
  if(!page)return fail(503);
  const html=await page.text();
  if(html.length>250000||!html.includes('id="root"')||!html.includes('/assets/'))return fail(503);
  return new Response(html,{status:200,headers:outputHeaders('text/html; charset=utf-8',access.cookie)});
 }
 if(url.pathname==='/admin-auth.css'||url.pathname==='/admin-auth.js'){
  if(request.method!=='GET'||url.search)return fail(400);
  return forwardToBff(env,request,url.pathname);
 }
 if(assets.test(url.pathname)){
  if(request.method!=='GET'||url.search)return fail(400);
  const r=await pinnedFile(url.pathname,pagesTransport);
  if(!r)return fail(503);
  const type=mime[url.pathname.slice(url.pathname.lastIndexOf('.')+1)];
  return new Response(r.body,{status:200,headers:outputHeaders(type)});
 }
 if(api.test(url.pathname)){
  if(!['GET','POST'].includes(request.method))return fail(405);
  if(request.headers.get('X-FP-Office-Request')!=='same-origin')return fail(403);
  return forwardToBff(env,request,url.pathname+url.search);
 }
 return fail(404);
}
export default {fetch(request,env){return handleAdminRequest(request,env)}};
