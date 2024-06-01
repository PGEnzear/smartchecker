// @ts-ignore
import NProgress from 'nprogress';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.beforeResolve((to, from, next) => {
    if (to.name) {
      NProgress.start()
    }
    next()
  })

  router.afterEach(() => {
    NProgress.done(true)
  })
});