import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Contrato de tipos que declara el servicio (go-coffee/src/contrato).
// El portal lo importa como "@contrato" para no describir los datos dos veces.
const carpetaContrato = fileURLToPath(new URL('../go-coffee/src/contrato', import.meta.url))
const carpetaDominio = fileURLToPath(new URL('../go-coffee/src/dominio', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@contrato': `${carpetaContrato}/contrato.ts`,
    },
  },
  server: {
    port: 5173,
    // Permite leer el contrato que vive en la carpeta del servicio.
    fs: { allow: ['.', carpetaContrato, carpetaDominio] },
  },
})
