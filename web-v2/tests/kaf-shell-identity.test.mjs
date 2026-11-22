import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'

test('KAF-SHELL-01: global Admin shell is KAF; Fajr Parsa is scoped only as an active workspace',async()=>{
 const source=await readFile(new URL('../src/office-v2/EnterpriseConsole.tsx',import.meta.url),'utf8')
 assert.match(source,/className="fpx-logo">KAF<\/div>/,'global brand is KAF')
 assert.match(source,/<strong>KAF<\/strong><small>ADMIN CONSOLE<\/small>/,'consistent title')
 assert.match(source,/KAF ADMIN<\/span>/,'breadcrumb brand is KAF')
 assert.match(source,/KAF Admin Console · QA/,'footer is KAF')
 assert.match(source,/\| KAF Admin Console/,'browser title names KAF')
 assert.match(source,/Active workspace: Fajr Parsa/,'Fajr remains the verified live workspace')
 assert.match(source,/\{privateOffice\?\(lang==='fa'\?'فضای کاری فعال':'Active workspace'\):tx\.workspace\}/)
 assert.match(source,/onClick=\{privateOffice\?undefined:\(\)=>go\('workspaces'\)\}/,'private current workspace is not a fake switcher')
 assert.match(source,/!collapsed&&!privateOffice&&<ChevronDown/,'disabled private switcher has no misleading chevron')
 assert.doesNotMatch(source,/go\(privateOffice\?'resources':'workspaces'\)/,'workspace tile must never unexpectedly navigate to Resources')
 assert.doesNotMatch(source,/className="fpx-brand"[^\n]*<strong>FAJR PARSA<\/strong>/,'Fajr must not be global brand')
})
