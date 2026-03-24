export const themes: Record<string, { bg: string; color: string; bodyClass?: string }> = {
    '/': {
        bg: 'var(--white)',
        color: 'var(--black)',
    },
    '/projects/:slug': {
        bg: 'var(--white)',
        color: 'var(--black)',
    },
    '/services': {
        bg: 'var(--framboise)',
        color: 'var(--pink)',
        bodyClass: 'theme-purple',
    },
    '/contact': {
        bg: 'var(--babyblue)',
        color: 'var(--blue)',
        bodyClass: 'theme-blue',
    },
}
