import {handleOffice} from './handler.ts'
import {officeDependencies} from './adapters.ts'
import {HTML,CSS,JS} from './ui.ts'

// Zero-cost staff office. UI is public; ALL case data requires a fresh Supabase
// bearer session + active Fajr KAF membership + explicit office grant.
// The secret remains only in Supabase's Edge runtime environment.
const origin='https://krzxajtrhvupyywovdzy.supabase.co'
const hdr={
 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' "+origin+"; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'"
}
const response=(text:string,kind:string)=>new Response(text,{headers:{...hdr,'Content-Type':kind}})
function publishableKey():string{
 const anon=Deno.env.get('SUPABASE_ANON_KEY')
 if(anon)return anon
 const map=Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}'
 try{const data=JSON.parse(map);for(const candidate of Object.values(data)){if(typeof candidate==='string'&&candidate.startsWith('sb_publishable_'))return candidate}}catch{}
 return ''
}
Deno.serve(async request=>{
 const path=new URL(request.url).pathname
 const key=publishableKey()
 if(!key)return Response.json({error:'configuration_unavailable'},{status:503,headers:hdr})
 if(request.method==='GET'&&(path.endsWith('/fajr-office')||path.endsWith('/fajr-office/')||path==='/'))return response(HTML,'text/html; charset=utf-8')
 if(request.method==='GET'&&path.endsWith('/app.css'))return response(CSS,'text/css; charset=utf-8')
 if(request.method==='GET'&&path.endsWith('/app.js'))return response(JS.replaceAll('__PUBLISHABLE_KEY__',key),'text/javascript; charset=utf-8')
 if(path.endsWith('/api/office')&&['GET','POST','OPTIONS'].includes(request.method)){
  try{
   const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
   const url=Deno.env.get('SUPABASE_URL')
   if(!serverKey||!url)return Response.json({error:'office_unavailable'},{status:503,headers:hdr})
   return await handleOffice(request,officeDependencies({enabled:true,origin,projectUrl:url,serverKey}))
  }catch{return Response.json({error:'office_unavailable'},{status:503,headers:hdr})}
 }
 return new Response('Not found',{status:404,headers:hdr})
})
