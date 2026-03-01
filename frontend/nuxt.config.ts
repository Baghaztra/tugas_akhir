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
});
