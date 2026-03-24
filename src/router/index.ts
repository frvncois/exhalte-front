import { createRouter, createWebHistory } from 'vue-router'
import { triggerHeaderLeave, setHeaderToHeader, clearRevClones, triggerRouteChange, triggerRouteChangeOut, triggerPageLeave } from '@/transitions/projectTransition'
import { themes } from '@/transitions/themes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { hasHeader: true },
    },
    {
      path: '/projects/:slug',
      name: 'single',
      component: () => import('../views/SingleView.vue'),
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/ServicesView.vue'),
      meta: { hasHeader: true },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { hasHeader: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
    if (to.path === '/' && !from.path.startsWith('/projects/')) clearRevClones()

    Array.from(document.body.classList)
        .filter(c => c.startsWith('theme-'))
        .forEach(c => document.body.classList.remove(c))

    const themePath = to.path.startsWith('/projects/') ? '/projects/:slug' : to.path
    const theme = themes[themePath]
    if (theme?.color) setTimeout(() => {
        document.body.style.color = theme.color
    }, 120)

    if (from.meta.hasHeader && to.meta.hasHeader) {
        setHeaderToHeader(true)
        triggerRouteChange(() => next(), theme?.bg ?? 'var(--white)')
    } else if (from.meta.hasHeader && !to.meta.hasHeader) {
        triggerHeaderLeave(() => next())
    } else {
        triggerPageLeave(() => next())
    }
})

router.afterEach((to) => {
    triggerRouteChangeOut()
    window.scrollTo(0, 0)
    document.body.style.color = ''
    const theme = themes[to.path.startsWith('/projects/') ? '/projects/:slug' : to.path]
    Array.from(document.body.classList)
        .filter(c => c.startsWith('theme-'))
        .forEach(c => document.body.classList.remove(c))
    if (theme?.bodyClass) document.body.classList.add(theme.bodyClass)
})

export default router
