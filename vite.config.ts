import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': decodeURIComponent(new URL('./src', import.meta.url).pathname) },
  },
  server: {
    /*
     * Bind IPv4 as well as IPv6.
     *
     * Vite's default host is `localhost`, which on a machine whose resolver
     * prefers IPv6 binds `[::1]` and *only* `[::1]`. Chrome resolves `localhost`
     * to `127.0.0.1` first and does not fall back, so the dev server ends up
     * reachable by curl and unreachable by the browser — which looks like a
     * hundred other problems before it looks like this one.
     *
     * `0.0.0.0` also puts it on the LAN address, which is what you want for
     * testing the mobile layout on an actual phone.
     */
    host: '0.0.0.0',
  },
})
