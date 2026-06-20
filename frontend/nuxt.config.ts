// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  // Hybrid Rendering: Mengatur strategi rendering per rute
  routeRules: {
    // Landing page di-prerender (dijadikan statis saat build) untuk performa dan SEO maksimal
    '/': { prerender: true },
    
    // Halaman internal dijadikan SPA murni (client-side rendering) untuk mengurangi beban server
    '/login': { ssr: false },
    '/forgot-password': { ssr: false },
    '/admin/**': { ssr: false },
    '/tracking/**': { ssr: false }
  }
});
