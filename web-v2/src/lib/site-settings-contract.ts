/** Fajr public settings: strict, versioned, published-only snapshot; no staff drafts. */
export type Languages4 = {fa:string;ps:string;en:string;ar:string}
export type PublishedSiteSettings = {
 version:1;site:'fajr-parsa';revision:string;publishedAt:string;
 contact:{whatsapp:string;email:string;phone?:string;mapUrl?:string};
 design:{fontPreset:'vazirmatn-manrope'|'estedad-inter'};
 office?:{address:Languages4;hours:Languages4};
 content?:{notice:Languages4;faq:{question:Languages4;answer:Languages4}[]};
}
type Obj=Record<string,unknown>
const obj=(x:unknown):x is Obj=>typeof x==='object'&&x!==null&&!Array.isArray(x)
const only=(x:Obj,allowed:string[])=>Object.keys(x).every(k=>allowed.includes(k))
const email=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/
export function validMapUrl(x:string):boolean {
 if(x.length>350)return false
 try{
  const u=new URL(x)
  if(u.protocol!=='https:'||u.username||u.password)return false
  if(u.hostname==='maps.app.goo.gl')return /^\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname)
  if(['www.google.com','google.com','maps.google.com'].includes(u.hostname))return u.pathname.startsWith('/maps')
  return u.hostname==='www.openstreetmap.org'&&u.pathname.startsWith('/')
 }catch{return false}
}
function text4(x:unknown,max:number):x is Languages4{
 if(!obj(x)||!only(x,['fa','ps','en','ar'])||Object.keys(x).length!==4)return false
 return (['fa','ps','en','ar'] as const).every(lang=>typeof x[lang]==='string'&&(x[lang] as string).length<=max)
}
function validOffice(x:unknown):x is NonNullable<PublishedSiteSettings['office']>{
 return obj(x)&&only(x,['address','hours'])&&Object.keys(x).length===2&&
  text4(x.address,300)&&text4(x.hours,120)
}
function validContent(x:unknown):x is NonNullable<PublishedSiteSettings['content']>{
 if(!obj(x)||!only(x,['notice','faq'])||Object.keys(x).length!==2||
 !text4(x.notice,500)||!Array.isArray(x.faq)||x.faq.length>5)return false
 return x.faq.every(item=>obj(item)&&only(item,['question','answer'])&&
 Object.keys(item).length===2&&text4(item.question,180)&&text4(item.answer,600))
}
export function parsePublishedSiteSettings(x:unknown):PublishedSiteSettings|null{
 if(!obj(x)||!only(x,['version','site','revision','publishedAt','contact','design','office','content']))return null
 if(x.version!==1||x.site!=='fajr-parsa'||typeof x.revision!=='string'||!/^[a-zA-Z0-9_-]{6,50}$/.test(x.revision)
 ||typeof x.publishedAt!=='string'||!Number.isFinite(Date.parse(x.publishedAt))
 ||!obj(x.contact)||!only(x.contact,['whatsapp','email','phone','mapUrl'])
 ||!obj(x.design)||!only(x.design,['fontPreset']))return null
 const {whatsapp,email:mail,phone,mapUrl}=x.contact
 if(typeof whatsapp!=='string'||!/^[1-9][0-9]{6,14}$/.test(whatsapp)
 ||typeof mail!=='string'||mail.length>254||!email.test(mail)
 ||(phone!==undefined&&(typeof phone!=='string'||! /^\+?[1-9][0-9]{6,14}$/.test(phone)))
 ||(mapUrl!==undefined&&(typeof mapUrl!=='string'||!validMapUrl(mapUrl))))return null
 const preset=x.design.fontPreset
 if(preset!=='vazirmatn-manrope'&&preset!=='estedad-inter')return null
 if(x.office!==undefined&&!validOffice(x.office))return null
 if(x.content!==undefined&&!validContent(x.content))return null
 return {
  version:1,site:'fajr-parsa',revision:x.revision,publishedAt:x.publishedAt,
  contact:{whatsapp,email:mail,...(phone?{phone}:{}),...(mapUrl?{mapUrl}:{})},
  design:{fontPreset:preset},
  ...(x.office?{office:x.office}:{}) ,
  ...(x.content?{content:x.content}:{})
 } as PublishedSiteSettings
}
