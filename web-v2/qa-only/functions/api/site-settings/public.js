// FP-SITE-CONTROL-01: QA-only public projection; no draft/secret or customer release.
const QA_HOST='fp-intake-safe-review.fajr-parsa-qa.pages.dev';
const CONFIG='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config';
const RPC='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_published_public';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Type':'application/json; charset=utf-8'};
const fail=(status,error)=>new Response(JSON.stringify({error}),{status,headers});
function publishedOnly(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||
  Object.keys(x).some(k=>!['version','site','revision','publishedAt','contact','design','office','content'].includes(k))||
  x.version!==1||x.site!=='fajr-parsa'||typeof x.revision!=='string'||
  !/^[a-zA-Z0-9_-]{6,50}$/.test(x.revision)||
  typeof x.publishedAt!=='string'||!Number.isFinite(Date.parse(x.publishedAt))||
  !x.contact||typeof x.contact!=='object'||Array.isArray(x.contact)||
  Object.keys(x.contact).some(k=>!['whatsapp','email','phone','mapUrl'].includes(k))||
  typeof x.contact.whatsapp!=='string'||!/^[1-9][0-9]{6,14}$/.test(x.contact.whatsapp)||
  typeof x.contact.email!=='string'||x.contact.email.length>254||
  !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/.test(x.contact.email)||
  !x.design||typeof x.design!=='object'||Array.isArray(x.design)||
  Object.keys(x.design).some(k=>k!=='fontPreset')||
  !['vazirmatn-manrope','estedad-inter'].includes(x.design.fontPreset))return false;
 return true;
}
export async function onRequestGet({request},transport=fetch){
 const url=new URL(request.url);
 if(url.hostname!==QA_HOST||url.pathname!=='/api/site-settings/public'||url.search)
  return fail(404,'not_found');
 try{
  const conf=await transport(CONFIG,{method:'GET',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!conf.ok)return fail(503,'temporarily_unavailable');
  const key=(await conf.json())?.publishableKey;
  if(typeof key!=='string'||key.length>900||!(/^(sb_publishable_|eyJ)/.test(key)))
   return fail(503,'temporarily_unavailable');
  const res=await transport(RPC,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',Accept:'application/json'},
   body:'{}',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(5000)});
  if(!res.ok)return fail(503,'temporarily_unavailable');
  const text=await res.text();
  if(text.length>16000)return fail(503,'temporarily_unavailable');
  let data;try{data=JSON.parse(text)}catch{return fail(503,'temporarily_unavailable')}
  if(data===null)return fail(404,'not_published');
  if(!publishedOnly(data))return fail(503,'temporarily_unavailable');
  return new Response(JSON.stringify(data),{status:200,headers});
 }catch{return fail(503,'temporarily_unavailable')}
}
