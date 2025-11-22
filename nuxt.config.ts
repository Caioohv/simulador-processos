// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    typeCheck: false,
    strict: false
  },
  alias: {
    '~/types': './types'
  },
  imports: {
    dirs: [
      'types/**'
    ]
  }
})
