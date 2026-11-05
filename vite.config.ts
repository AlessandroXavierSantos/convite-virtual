import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No GitHub Pages o site fica em uma subpasta (ex.: /convite-virtual/).
  // A publicação automática define BASE_PATH; localmente o padrão "/" continua valendo.
  base: process.env.BASE_PATH ?? '/',
})
