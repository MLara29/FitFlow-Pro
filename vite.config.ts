import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o mesmo build funciona no domínio próprio, no GitHub Pages e dentro do app Android.
  base: './',
  plugins: [react()],
})
