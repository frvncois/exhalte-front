export const themes: Record<string, { bg: string; transitionBg?: string; color: string; bodyClass?: string }> = {
    '/': {
        bg: '#f9f9f9',
        color: 'var(--black)',
    },
    '/projects/:slug': {
        bg: '#f9f9f9',
        color: 'var(--black)',
    },
    '/services': {
        bg: '#5A0834',
        transitionBg: '#5A0834',
        color: 'var(--pink)',
        bodyClass: 'theme-purple',
    },
    '/contact': {
        bg: '#c2e6ee',
        transitionBg: '#c2e6ee',
        color: 'var(--blue)',
        bodyClass: 'theme-blue',
    },
}
