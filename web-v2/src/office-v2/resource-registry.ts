/**
 * Design-only resource registry contract. No remote APIs, no authorization or
 * database reads/writes. Registry associations are NOT ownership verification.
 */
export type ResourceKind='website'|'application'|'document'|'integration'
export type Provider='Cloudflare'|'Vercel'|'WordPress'|'Other'
export type ResourceStatus='bookmark'|'detached'
export type PreviewResource={
 id:string;name:string;kind:ResourceKind;provider:Provider;url:string;
 workspace:string;status:ResourceStatus;capabilities:readonly string[];
}
export const previewSeed:PreviewResource[]=[
 {id:'sample-fajr',name:'فجرپارسا | نمونه',kind:'website',provider:'Cloudflare',
  url:'https://fajr-parsa-qa.pages.dev/',workspace:'Fajr Parsa',status:'bookmark',
  capabilities:['view-public']},
 {id:'sample-app',name:'اپلیکیشن نمونه',kind:'application',provider:'Other',
  url:'https://example.org/app',workspace:'Personal',status:'bookmark',capabilities:['view-public']},
 {id:'sample-docs',name:'اسناد نمونه',kind:'document',provider:'Other',
  url:'https://example.org/docs',workspace:'Personal',status:'bookmark',capabilities:['view-public']},
]
export function validatePublicUrl(input:string):string|null{
 try{
  const u=new URL(input.trim())
  if(u.protocol!=='https:'||u.username||u.password||u.port)return null
  const hostname=u.hostname.toLowerCase().replace(/\.$/,'')
  if(hostname.length>253||!hostname.includes('.')||hostname.includes('..')||
     !/^[a-z0-9.-]+$/.test(hostname)||hostname.startsWith('-')||
     hostname==='localhost'||hostname.endsWith('.localhost')||
     hostname.endsWith('.local')||hostname.endsWith('.internal')||
     hostname.endsWith('.test')||hostname.endsWith('.invalid')||
     hostname.endsWith('.example')||hostname.endsWith('.onion'))return null
  if(/^\d+(?:\.\d+){3}$/.test(hostname)||hostname.includes(':'))return null
  u.hash=''
  return u.toString()
 }catch{return null}
}
export function addBookmark(
 items:readonly PreviewResource[],
 draft:{name:string;url:string;provider:Provider;kind:ResourceKind;workspace:string}
):{error:'invalid_name'|'invalid_url'|'duplicate'|null;items:PreviewResource[];id?:string}{
 const name=draft.name.trim()
 if(name.length<2||name.length>75)return {error:'invalid_name',items:[...items]}
 const url=validatePublicUrl(draft.url)
 if(!url)return {error:'invalid_url',items:[...items]}
 const withoutSlash=(s:string)=>s.replace(/\/+$/,'').toLowerCase()
 if(items.some(x=>x.status!=='detached'&&withoutSlash(x.url)===withoutSlash(url)))return {error:'duplicate',items:[...items]}
 const id='sample-resource-'+(items.reduce((m,x)=>Math.max(m,Number(x.id.replace('sample-resource-',''))||0),0)+1)
 const item:PreviewResource={id,name,kind:draft.kind,provider:draft.provider,url,
  workspace:draft.workspace==='Personal'?'Personal':'Fajr Parsa',
  status:'bookmark',capabilities:['view-public']}
 return {error:null,id,items:[...items,item]}
}
export function detachFromConsole(items:readonly PreviewResource[],id:string):PreviewResource[]{
 return items.map(item=>item.id===id?{...item,status:'detached'}:item)
}
export function relinkInConsole(items:readonly PreviewResource[],id:string):PreviewResource[]{
 return items.map(item=>item.id===id?{...item,status:'bookmark'}:item)
}
export const supportedRights={
 bookmark:['view-public'],
 verifiedRead:['view-public','read-provider-metadata'],
 editor:['view-public','read-provider-metadata','edit-approved-content'],
 publisher:['view-public','read-provider-metadata','edit-approved-content','publish-with-review'],
} as const
