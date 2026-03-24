export const themes: Record<string, { bg: string; transitionBg?: string; color: string; bodyClass?: string }> = {
    '/': {
        bg: '#FFFFFF',
        color: 'var(--black)',
    },
    '/projects/:slug': {
        bg: '#FFFFFF',
        color: 'var(--black)',
    },
    '/services': {
        bg: '#5D1046',
        transitionBg: '#5D1046',
        color: 'var(--pink)',
        bodyClass: 'theme-purple',
    },
    '/contact': {
        bg: '#B7EBF7',
        transitionBg: '#B7EBF7',
        color: 'var(--blue)',
        bodyClass: 'theme-blue',
    },
}
