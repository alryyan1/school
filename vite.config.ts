import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // Comes with Node.js
// https://vite.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      '@':path.resolve(__dirname,'./src')
    }
  },
  plugins: [react(),tailwindcss()],
})
