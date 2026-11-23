import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { brandTokens } from './scripts/vite-plugin-brand-tokens'

export default defineConfig({ plugins: [react(), brandTokens()] })
