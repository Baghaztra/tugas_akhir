export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const auth = useAuthStore()
  auth.init()

  // Redirect to work board if already logged in and on login page
  if (auth.isAuthenticated && to.path === '/login') {
    const target = auth.user?.is_owner ? '/admin/dashboard' : '/admin/work'
    return navigateTo(target)
  }

  // Protect /admin/* routes
  if (!auth.isAuthenticated && to.path.startsWith('/admin')) {
    return navigateTo('/login')
  }

  // Owner-only routes (user management)
  if (to.path.startsWith('/admin/users') && !auth.user?.is_owner) {
    return navigateTo('/admin/work')
  }

  // Non-owner cannot access dashboard or reports
  if (!auth.user?.is_owner && (to.path === '/admin/dashboard' || to.path.startsWith('/admin/reports'))) {
    return navigateTo('/admin/work')
  }
})
