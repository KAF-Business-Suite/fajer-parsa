/**
 * KAF-35 / Fajr QA — serve the SAME built 46-module React console on
 * the private Office origin; no second SPA/auth/database is created.
 *
 * The frontend is pinned to an immutable Cloudflare Pages QA deployment,
 * not a mutable branch alias. Never send cookies/tokens to Pages.
 * The browser receives static JS/CSS from /assets on the private origin,
 * while all real data calls go to the existing, permissioned Office BFF.
 *
 * Stage and test in QA before updating the pin. No live writes here.
 */
const PINNED_PAGES_ORIGIN='https://b73caba7.fajr-parsa-qa.pages.dev';
const OFFICE_ORIGIN='https://fajr-office-qa.khoojafahim.workers.dev';
// Temporary QA-only, fixed-source anonymous probe; returns no session or provider data.
const QA_SOURCE_CHECK='/__qa/console-source-health';
const MIME={
 js:'text/javascript; charset=utf-8',
 css:'text/css; charset=utf-8',
 woff2:'font/woff2',
 svg:'image/svg+xml',
 png:'image/png',
 webp:'image/webp',
 ico:'image/x-icon',
};
const ASSET_PATH=/^\/assets\/[A-Za-z0-9._-]{1,180}\.(?:js|css|woff2|svg|png|webp|ico)$/;
const headersFor=(security,contentType)=>{
 const headers=new Headers(security);
 headers.set('Content-Type',contentType);
 headers.set('Cache-Control','private, no-store');
 headers.set('X-Robots-Tag','noindex, nofollow');
 headers.set('Cross-Origin-Resource-Policy','same-origin');
 return headers;
};
const fail=(status,security,stage='unavailable')=>{
 const h=headersFor(security,'text/plain; charset=utf-8');
 h.set('X-FP-Console-Stage',stage);
 return new Response(status===404?'Not Found':'Office Console temporarily unavailable ('+stage+')',{status,headers:h});
};
async function pinnedGet(path,transport){
 const response=await transport(PINNED_PAGES_ORIGIN+path,{
  method:'GET',redirect:'manual',cache:'no-store',
  headers:{Accept:'*/*'},
  signal:AbortSignal.timeout(8000)
 });
 if(response.status!==200||!response.ok)return null;
 const advertisedSize=Number(response.headers.get('Content-Length')||0);
 if(advertisedSize>8_000_000)return null;
 return response;
}
export function consoleAssetPathAllowed(pathname){return ASSET_PATH.test(pathname)}
export function consolePinnedOrigin(){return PINNED_PAGES_ORIGIN}
export async function handlePrivateConsole(request,env,services,transport=fetch){
 const url=new URL(request.url);
 if(url.hostname!=='fajr-office-qa.khoojafahim.workers.dev')return null;
 const isPage=url.pathname==='/console';
 const isAsset=consoleAssetPathAllowed(url.pathname);
 const isSourceCheck=url.pathname===QA_SOURCE_CHECK;
 if(!isPage&&!isAsset&&!isSourceCheck)return null;
 if(request.method!=='GET')return fail(405,services.security,'method');
 // Browsers, installed apps and chat link wrappers can append benign tracking
 // parameters to /console. Ignore them: no parameter is ever forwarded to Auth,
 // used for a redirect, or sent to the immutable Pages origin. Access is ALWAYS
 // rechecked with the encrypted HttpOnly cookie and live owner role.
 // Keep the strict query ban on the /assets proxy and QA source probe.
 if(url.search&&!isPage)return fail(400,services.security,'query');
 if(isSourceCheck){
  const h=headersFor(services.security,'application/json; charset=utf-8');
  try{
   const response=await pinnedGet('/office-preview',transport);
   if(!response)return new Response(JSON.stringify({status:'source_unavailable'}),{status:503,headers:h});
   const html=await response.text();
   const valid=html.length<=250000&&html.includes('id="root"')&&html.includes('/assets/');
   return new Response(JSON.stringify({status:valid?'ready':'invalid_html'}),{status:valid?200:503,headers:h});
  }catch{return new Response(JSON.stringify({status:'source_unavailable'}),{status:503,headers:h})}
 }
 if(isAsset){
  try{
   const upstream=await pinnedGet(url.pathname,transport);
   if(!upstream)return fail(503,services.security,'asset_upstream');
   const ext=url.pathname.split('.').pop();
   const head=headersFor(services.security,MIME[ext]);
   // Static public resources contain no staff data; no cookies to Pages.
   return new Response(upstream.body,{status:200,headers:head});
  }catch{return fail(503,services.security,'asset_transport')}
 }
 const cookie=request.headers.get('Cookie')||'';
 if(!cookie.includes('__Host-fp-office-session=')){
  return new Response(null,{status:302,headers:{...services.security,Location:'/', 'Cache-Control':'no-store'}})
 }
 // Browser navigation cannot send the custom CSRF/API header. Owner access
 // is verified through the existing encrypted cookie, Auth and SQL role RPC.
 // Do not couple console navigation to the cases-list quota/read endpoint.
 const privateSessionRequest=new Request(OFFICE_ORIGIN+'/api/session',{
  method:'GET',headers:{Cookie:cookie,'X-FP-Office-Request':'same-origin'}
 });
 let auth;
 try{auth=await services.handleConsoleAccess(privateSessionRequest,env,transport)}
 catch{return fail(503,services.security,'session_exception')}
 if(!auth||auth.status!==200){
  if(auth?.status===401)return new Response(null,{status:302,headers:{
   ...services.security,Location:'/', 'Cache-Control':'no-store',
   ...(auth.headers.get('Set-Cookie')?{'Set-Cookie':auth.headers.get('Set-Cookie')}:{})
  }});
  return fail(auth?.status===403?403:503,services.security,auth?.status===403?'permission':'session_upstream');
 }
 try{
  const upstream=await pinnedGet('/office-preview',transport);
  if(!upstream)return fail(503,services.security,'source_upstream');
  const html=await upstream.text();
  if(html.length>250000||!html.includes('id="root"')||!html.includes('/assets/'))return fail(503,services.security,'source_html');
  const out=headersFor(services.security,'text/html; charset=utf-8');
  const original=out.get('Content-Security-Policy')||"default-src 'none'; script-src 'self'; style-src 'self'";
  // Fontsource emits local woff2 assets; do not allow external scripts/CSS.
  out.set('Content-Security-Policy',original+"; font-src 'self'");
  const rotated=auth.headers.get('Set-Cookie');
  if(rotated)out.set('Set-Cookie',rotated);
  return new Response(html,{status:200,headers:out});
 }catch{return fail(503,services.security,'source_transport')}
}
