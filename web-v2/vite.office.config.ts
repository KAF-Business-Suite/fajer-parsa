import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath} from 'node:url'

export default defineConfig({
 plugins:[react(),tailwindcss()],
 base:'./',
 build:{
   outDir:'dist-office-preview',
   emptyOutDir:true,
   rollupOptions:{input:fileURLToPath(new URL('./office-preview.html',import.meta.url))}
 },
})
