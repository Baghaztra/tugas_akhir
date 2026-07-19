export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const auth = useAuthStore()
  auth.init()

  // Redirect to dashboard if already logged in and on login page
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/admin/dashboard')
  }

  // Protect /admin/* routes
  if (!auth.isAuthenticated && to.path.startsWith('/admin')) {
    return navigateTo('/login')
  }
})
