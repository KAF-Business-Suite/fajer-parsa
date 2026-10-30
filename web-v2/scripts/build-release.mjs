import {readFile,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
const mode=process.argv[2]
if(!['production','qa'].includes(mode))throw new Error('Choose production or qa explicitly')
const qa=JSON.parse(await readFile(new URL('../config/intake-qa.json',import.meta.url),'utf8'))
if(qa.syntheticOnly!==true||qa.productionEnabled!==false||qa.origin!=='https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev'||qa.endpoint!=='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa'||typeof qa.sitekey!=='string'||!qa.sitekey.trim())throw new Error('Unexpected intake QA configuration')
const env={...process.env,VITE_FAJR_INTAKE_ENABLED:mode==='qa'?'true':'false',VITE_FAJR_TURNSTILE_SITEKEY:mode==='qa'?qa.sitekey:'',VITE_FAJR_INTAKE_ENDPOINT:mode==='qa'?qa.endpoint:''}
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','-b'],{stdio:'inherit',env})
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{stdio:'inherit',env})
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
const dirty=Boolean(execFileSync('git',['status','--porcelain','--','web-v2'],{encoding:'utf8'}).trim())
await writeFile('dist/release.json',JSON.stringify({mode,sourceCommit:commit,sourceDirty:dirty,intakeEnabled:mode==='qa',syntheticOnly:mode==='qa'},null,2)+'\n')
console.log(`Built ${mode}; intake ${mode==='qa'?'synthetic only':'disabled'}. No deployment performed.`)
