export const themes: Record<string, { bg: string; transitionBg?: string; color: string; bodyClass?: string }> = {
    '/': {
        bg: '#FF4DFB',
        transitionBg: '#FF4DFB',
        color: 'var(--light)',
        bodyClass: 'theme-pink',
    },
    '/projects': {
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
        bg: '#989e25',
        transitionBg: '#989e25',
        color: 'var(--white)',
        bodyClass: 'theme-yellow',
    },
}
