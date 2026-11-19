// FP-SITE-CONTROL-01: QA-only public projection; no draft/secret or customer release.
const QA_HOST='fp-intake-safe-review.fajr-parsa-qa.pages.dev';
const CONFIG='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config';
const RPC='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_site_published_public';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Type':'application/json; charset=utf-8'};
const fail=(status,error)=>new Response(JSON.stringify({error}),{status,headers});
// Keep this security boundary aligned with src/lib/site-settings-contract.ts.
// QA runtime is copied into functions/ by CI, so imports relative to this file
// would change location; its explicit strict field checks are regression-tested.
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const only=(x,fields)=>Object.keys(x).every(k=>fields.includes(k));
function validMapUrl(value){
 if(typeof value!=='string'||value.length>350)return false;
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password)return false;
  if(u.hostname==='maps.app.goo.gl')return /^\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname);
  if(['www.google.com','google.com','maps.google.com'].includes(u.hostname))return u.pathname.startsWith('/maps');
  return u.hostname==='www.openstreetmap.org'&&u.pathname.startsWith('/');
 }catch{return false}
}
function text4(x,max){
 return isObject(x)&&only(x,['fa','ps','en','ar'])&&Object.keys(x).length===4&&
  ['fa','ps','en','ar'].every(lang=>typeof x[lang]==='string'&&x[lang].length<=max);
}
function validOffice(x){
 return isObject(x)&&only(x,['address','hours'])&&Object.keys(x).length===2&&
  text4(x.address,300)&&text4(x.hours,120);
}
function validContent(x){
 return isObject(x)&&only(x,['notice','faq'])&&Object.keys(x).length===2&&
  text4(x.notice,500)&&Array.isArray(x.faq)&&x.faq.length<=5&&
  x.faq.every(item=>isObject(item)&&only(item,['question','answer'])&&
   Object.keys(item).length===2&&text4(item.question,180)&&text4(item.answer,600));
}
function publishedOnly(x){
 if(!isObject(x)||!only(x,['version','site','revision','publishedAt','contact','design','office','content'])||
  x.version!==1||x.site!=='fajr-parsa'||typeof x.revision!=='string'||
  !/^[a-zA-Z0-9_-]{6,50}$/.test(x.revision)||
  typeof x.publishedAt!=='string'||!Number.isFinite(Date.parse(x.publishedAt))||
  !isObject(x.contact)||!only(x.contact,['whatsapp','email','phone','mapUrl'])||
  !isObject(x.design)||!only(x.design,['fontPreset'])||
  Object.keys(x.design).length!==1)return false;
 const {whatsapp,email,phone,mapUrl}=x.contact;
 if(typeof whatsapp!=='string'||!/^[1-9][0-9]{6,14}$/.test(whatsapp)||
  typeof email!=='string'||email.length>254||
  !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/.test(email)||
  (phone!==undefined&&(typeof phone!=='string'||! /^\+?[1-9][0-9]{6,14}$/.test(phone)))||
  (mapUrl!==undefined&&!validMapUrl(mapUrl))||
  !['vazirmatn-manrope','estedad-inter'].includes(x.design.fontPreset)||
  (x.office!==undefined&&!validOffice(x.office))||
  (x.content!==undefined&&!validContent(x.content)))return false;
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
