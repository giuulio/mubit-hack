import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Python API (router/api.py) runs on port 8000.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
})
