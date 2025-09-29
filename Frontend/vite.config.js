import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   allowedHosts: ["354c3d01d1d5.ngrok-free.app"], // 👈 add your ngrok URL here
  // },
  server: {
    host: "0.0.0.0", // 👈 allow access from local IP
    port: 5173,      // or any free port
  },
})
