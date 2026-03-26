import { createRouter, createWebHistory } from 'vue-router'
import { triggerHeaderLeave, setHeaderToHeader, clearRevClones, clearFwdClones, triggerPageLeave, getFwdClones, getRevClones, triggerRouteTransition, triggerRouteTransitionOut, setProjectToProject } from '@/transitions/projectTransition'
import { themes } from '@/transitions/themes'
import lenis from '@/lib/lenis'

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
    {
      path: '/policy/:slug',
      name: 'policy',
      component: () => import('../views/PrivacyView.vue'),
      meta: { hasHeader: true },
    },
  ],
})

function stripTheme() {
    Array.from(document.body.classList)
        .filter(c => c.startsWith('theme-'))
        .forEach(c => document.body.classList.remove(c))
}

router.beforeEach(async (to, from) => {
    setProjectToProject(from.path.startsWith('/projects/') && to.path.startsWith('/projects/'))
    if (to.path === '/' && !from.path.startsWith('/projects/')) clearRevClones()
    if (!to.path.startsWith('/projects/')) clearFwdClones()

    const themePath = to.path.startsWith('/projects/') ? '/projects/:slug' : to.path
    const theme = themes[themePath]

    if (from.meta.hasHeader && to.meta.hasHeader) {
        setHeaderToHeader(true)
        await new Promise<void>(resolve => triggerPageLeave(resolve))
        await new Promise<void>(resolve => triggerRouteTransition(resolve, theme?.transitionBg ?? '#FFFFFF'))
    } else if (from.meta.hasHeader && !to.meta.hasHeader) {
        if (getFwdClones().length) {
            await new Promise<void>(resolve => triggerHeaderLeave(resolve))
        } else {
            await Promise.all([
                new Promise<void>(resolve => triggerHeaderLeave(resolve)),
                new Promise<void>(resolve => triggerPageLeave(resolve)),
            ])
            await new Promise<void>(resolve => triggerRouteTransition(resolve, theme?.transitionBg ?? '#FFFFFF'))
        }
    } else {
        if (!getRevClones().length) {
            await new Promise<void>(resolve => triggerPageLeave(resolve))
            await new Promise<void>(resolve => triggerRouteTransition(resolve, theme?.transitionBg ?? '#FFFFFF'))
        } else {
            await new Promise<void>(resolve => triggerPageLeave(resolve))
        }
    }
})

router.afterEach((to) => {
    triggerRouteTransitionOut()
    lenis.start()
    window.scrollTo(0, 0)
    document.body.style.color = ''
    const theme = themes[to.path.startsWith('/projects/') ? '/projects/:slug' : to.path]
    document.body.style.transition = 'color 0.6s ease'
    Array.from(document.body.classList)
        .filter(c => c.startsWith('theme-'))
        .forEach(c => document.body.classList.remove(c))
    if (theme?.bodyClass) document.body.classList.add(theme.bodyClass)
    requestAnimationFrame(() => { document.body.style.transition = '' })
})

export default router
