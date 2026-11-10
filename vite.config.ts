import react from '@vitejs/plugin-react'
import { readdirSync } from 'node:fs'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o mesmo build funciona no domínio próprio, no GitHub Pages e dentro do app Android.
  base: './',
  plugins: [react()],
  // Arquivos de public/media: um GIF chamado <id-do-exercício>.gif vira a mídia daquele exercício.
  define: { __MEDIA_FILES__: JSON.stringify(readdirSync('public/media')) },
})
