/** Fajr public settings are an allowlisted published snapshot, never a staff draft. */
export type PublishedSiteSettings = {
 version:1; site:'fajr-parsa'; revision:string; publishedAt:string;
 contact:{whatsapp:string;email:string;phone?:string;mapUrl?:string};
 design:{fontPreset:'vazirmatn-manrope'|'estedad-inter'};
}
type Obj=Record<string,unknown>
const obj=(x:unknown):x is Obj=>typeof x==='object'&&x!==null&&!Array.isArray(x)
const only=(x:Obj,allowed:string[])=>Object.keys(x).every(k=>allowed.includes(k))
const email=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/
export function validMapUrl(x:string):boolean {
 if(x.length>350)return false
 try{
  const u=new URL(x);
  if(u.protocol!=='https:'||u.username||u.password)return false
  if(u.hostname==='maps.app.goo.gl')return /^\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname)
  if(['www.google.com','google.com','maps.google.com'].includes(u.hostname))return u.pathname.startsWith('/maps')
  return u.hostname==='www.openstreetmap.org'&&u.pathname.startsWith('/')
 }catch{return false}
}
export function parsePublishedSiteSettings(x:unknown):PublishedSiteSettings|null{
 if(!obj(x)||!only(x,['version','site','revision','publishedAt','contact','design']))return null
 if(x.version!==1||x.site!=='fajr-parsa'||typeof x.revision!=='string'||!/^[a-zA-Z0-9_-]{6,50}$/.test(x.revision)
 ||typeof x.publishedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(x.publishedAt)||!Number.isFinite(Date.parse(x.publishedAt))
 ||!obj(x.contact)||!only(x.contact,['whatsapp','email','phone','mapUrl'])
 ||!obj(x.design)||!only(x.design,['fontPreset']))return null
 const {whatsapp,email:mail,phone,mapUrl}=x.contact
 if(typeof whatsapp!=='string'||!/^[1-9][0-9]{6,14}$/.test(whatsapp)
 ||typeof mail!=='string'||mail.length>254||!email.test(mail)
 ||(phone!==undefined&&(typeof phone!=='string'||!/^\+?[1-9][0-9]{6,14}$/.test(phone)))
 ||(mapUrl!==undefined&&(typeof mapUrl!=='string'||!validMapUrl(mapUrl))))return null
 const preset=x.design.fontPreset
 if(preset!=='vazirmatn-manrope'&&preset!=='estedad-inter')return null
 return {version:1,site:'fajr-parsa',revision:x.revision,publishedAt:x.publishedAt,
   contact:{whatsapp,email:mail,...(phone?{phone}:{}),...(mapUrl?{mapUrl}:{})},
   design:{fontPreset:preset}}
}
