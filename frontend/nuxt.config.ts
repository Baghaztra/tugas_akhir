// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  // Vercel preset untuk ISR support
  nitro: {
    preset: "vercel",
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  // Hybrid Rendering: Mengatur strategi rendering per rute
  routeRules: {
    // Landing page ISR (revalidate setiap 15 menit)
    "/": { isr: 900 },

    // Halaman internal dijadikan SPA murni (client-side rendering) untuk mengurangi beban server
    "/login": { ssr: false },
    "/forgot-password": { ssr: false },
    "/admin/**": { ssr: false },
    "/tracking/**": { ssr: false },
  },
});
