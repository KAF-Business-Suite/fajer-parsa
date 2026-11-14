// Local Cloudflare Pages Functions integration test — NEVER deploys anything.
// Builds a disposable Pages fixture that mounts the same guarded server-only entry.
// Confirms that a real local Wrangler runtime routes /api/requests and stays fail-closed.
// This is NOT real HTTPS, real Turnstile verification or Supabase/office readback.
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {build} from 'esbuild'

const root=await mkdtemp(join(tmpdir(),'fajr-intake-pages-'))
const port=8797
const origin='http://127.0.0.1:'+port
let logs='',proc
try{
  await mkdir(join(root,'functions','api'),{recursive:true})
  await mkdir(join(root,'dist'),{recursive:true})
  await writeFile(join(root,'dist','index.html'),'<!doctype html><html><body>FP-INTAKE-01 isolated runtime</body></html>')
  await build({
    entryPoints:[resolve('server/intake/pages-entry.ts')],
    bundle:true,format:'esm',platform:'browser',target:'es2022',
    outfile:join(root,'functions','api','requests.js'),logLevel:'silent'
  })
  const safeEnv={...process.env,
    WRANGLER_SEND_METRICS:'false',FAJR_INTAKE_ENABLED:'false',
    FAJR_INTAKE_ORIGIN:'',SUPABASE_URL:'',SUPABASE_SERVER_KEY:'',
    TURNSTILE_SECRET_KEY:''}
  proc=spawn('npx',['--yes','wrangler@4.76.0','pages','dev','dist','--ip','127.0.0.1','--port',String(port),'--compatibility-date','2026-11-05'],{
    cwd:root,env:safeEnv,detached:true,stdio:['ignore','pipe','pipe']
  })
  proc.stdout.on('data',chunk=>{logs+=String(chunk);logs=logs.slice(-6000)})
  proc.stderr.on('data',chunk=>{logs+=String(chunk);logs=logs.slice(-6000)})
  const deadline=Date.now()+75000
  let ready=false
  while(Date.now()<deadline){
    if(proc.exitCode!==null)throw Error('Wrangler unexpectedly exited: '+logs.slice(-1800))
    try{const r=await fetch(origin+'/',{signal:AbortSignal.timeout(1500)});if(r.ok){ready=true;break}}catch{}
    await new Promise(resolve=>setTimeout(resolve,300))
  }
  assert.ok(ready,'Wrangler Pages fixture did not become available: '+logs.slice(-1800))
  const rootResponse=await fetch(origin+'/')
  assert.equal(rootResponse.status,200)
  assert.match(await rootResponse.text(),/FP-INTAKE-01 isolated runtime/)
  for(const method of ['GET','POST']){
    const r=await fetch(origin+'/api/requests',{
      method,headers:method==='POST'?{'Content-Type':'application/json','Origin':origin}:{},
      ...(method==='POST'?{body:JSON.stringify({requestId:'synthetic-do-not-send'})}:{})
    })
    assert.equal(r.status,503,'Guarded Pages Function must not allow '+method)
    assert.equal(r.headers.get('Cache-Control'),'no-store')
    assert.deepEqual(await r.json(),{error:'intake_not_enabled'})
  }
  console.log(JSON.stringify({gate:'FP-INTAKE-01',runtime:'local Cloudflare Pages Functions (disposable)',route:'/api/requests',status:'PASS',productionDeploy:false,externalRequests:0,databaseWrites:0}))
}finally{
  if(proc?.pid){try{process.kill(-proc.pid,'SIGTERM')}catch{}}
  await rm(root,{recursive:true,force:true})
}
