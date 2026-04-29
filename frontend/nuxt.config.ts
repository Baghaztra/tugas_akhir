// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxtjs/tailwindcss"],

  runtimeConfig: {
    public: {
      // Override with env var: NUXT_PUBLIC_API_BASE=http://your-api-domain.com
      apiBase: "http://localhost:8000",
    },
  },

  // Hybrid Rendering: Mengatur strategi rendering per rute
  routeRules: {
    // Landing page di-prerender (dijadikan statis saat build) untuk performa dan SEO maksimal
    '/': { prerender: true },
    
    // Halaman internal dijadikan SPA murni (client-side rendering) untuk mengurangi beban server
    '/admin/**': { ssr: false },
    '/task-list/**': { ssr: false },
    '/tracking/**': { ssr: false }
  }
});
