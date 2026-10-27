// Export the real compiled application as an offline review file, without deploying.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { resolve, dirname, extname } from 'node:path'
const root = resolve('dist')
const original = await readFile(resolve(root,'index.html'),'utf8')
const jsPath = original.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)[1]
const cssPath = original.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/)[1]
const file = path => resolve(root,'.'+(path.startsWith('/')?path:'/'+path))
const types = {'.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'}
async function data(path) { return `data:${types[extname(path)] || 'application/octet-stream'};base64,${(await readFile(path)).toString('base64')}` }
let js = await readFile(file(jsPath),'utf8')
for (const name of await readdir(resolve(root,'media'))) js = js.replaceAll('/media/'+name,await data(resolve(root,'media',name)))
let css = await readFile(file(cssPath),'utf8')
for(const match of [...css.matchAll(/url\(([^)]+)\)/g)]) {
  const path=match[1].replace(/^["']|["']$/g,'')
  if(path.startsWith('data:') || path.startsWith('http')) continue
  css=css.replace(match[0],`url("${await data(path.startsWith('/')?file(path):resolve(dirname(file(cssPath)),path))}")`)
}
let html=original.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/,()=>'<script type="module">'+js.replaceAll('</script','<\\/script')+'</script>')
html=html.replace(/<link[^>]*href="[^"]+\.css"[^>]*>/,()=>'<style>'+css+'</style>')
await mkdir('test-results',{recursive:true})
await writeFile('test-results/Fajr-Parsa-Preview.html',html)
console.log('test-results/Fajr-Parsa-Preview.html')
