// Forward clones: [cover, span, title, cover0, details0, cover1, details1, ...]
// Reverse clones: [cover, span, title, cover0, info0, cover1, info1, ...]

import lenis from '@/lib/lenis'

let projectToProject = false
export function setProjectToProject(v: boolean) { projectToProject = v }
export function consumeProjectToProject(): boolean { const v = projectToProject; projectToProject = false; return v }

let fwdClones: HTMLElement[] = []
let revClones: HTMLElement[] = []
let clickedIndex = -1

function getLenisScrollOffset(): number {
    return lenis.scroll
}

function makeFixedClone(el: Element): HTMLElement {
    const rect = el.getBoundingClientRect()
    const clone = el.cloneNode(true) as HTMLElement
    Object.assign(clone.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        padding: '0',
        pointerEvents: 'none',
        zIndex: '9999',
        transformOrigin: 'top left',
    })
    document.body.appendChild(clone)
    return clone
}

// Called on grid item click
export function captureFwdClones(
    index: number,
    cover: Element,
    span: Element,
    title: Element,
    others: { cover: Element, details: Element }[],
) {
    clearFwdClones()
    clickedIndex = index
    const otherElements = others.flatMap(o => [o.cover, o.details])
    fwdClones = [cover, span, title, ...otherElements].map(makeFixedClone)
}

export function getFwdClones() { return fwdClones }
export function getClickedIndex() { return clickedIndex }
export function clearFwdClones() {
    fwdClones.forEach(c => c.remove())
    fwdClones = []
}

// Called on retour click
export function captureRevClones(elements: Element[]) {
    clearRevClones()
    revClones = elements.map(makeFixedClone)
}

export function getRevClones() { return revClones }
export function clearRevClones() {
    revClones.forEach(c => c.remove())
    revClones = []
}

// Page leave callbacks: persist while component is mounted, removed on unmount
type PageLeaveFn = (done: () => void) => void
const pageLeaveCallbacks = new Set<PageLeaveFn>()

export function registerPageLeave(cb: PageLeaveFn): () => void {
    pageLeaveCallbacks.add(cb)
    return () => pageLeaveCallbacks.delete(cb)
}

export function triggerPageLeave(done: () => void) {
    const cbs = [...pageLeaveCallbacks]
    if (!cbs.length) { done(); return }
    let n = 0
    cbs.forEach(cb => cb(() => { if (++n === cbs.length) done() }))
}


// Route transition overlay
let routeTransitionCallback: ((done: () => void, bg: string) => void) | null = null
let routeTransitionOutCallback: (() => void) | null = null
export function registerRouteTransition(cb: (done: () => void, bg: string) => void) { routeTransitionCallback = cb }
export function registerRouteTransitionOut(cb: () => void) { routeTransitionOutCallback = cb }
export function triggerRouteTransition(done: () => void, bg: string) {
    if (routeTransitionCallback) routeTransitionCallback(done, bg)
    else done()
}
export function triggerRouteTransitionOut() { routeTransitionOutCallback?.() }

// Locale reload callback
let reloadCallback: (() => void) | null = null
export function registerReload(cb: () => void) { reloadCallback = cb }
export function triggerReload() { reloadCallback ? reloadCallback() : window.location.reload() }

// Header-to-header flag: skip in/out animation when both routes have SharedHeader
let headerToHeader = false
export function setHeaderToHeader(v: boolean) { headerToHeader = v }
export function getHeaderToHeader() { return headerToHeader }

// Header leave callback: registered by SharedHeader, triggered by global router guard
let headerLeaveCallback: ((done: () => void) => void) | null = null
export function registerHeaderLeave(cb: (done: () => void) => void) { headerLeaveCallback = cb }
export function clearHeaderLeave() { headerLeaveCallback = null }
export function triggerHeaderLeave(done: () => void) {
    if (headerLeaveCallback) headerLeaveCallback(done)
    else done()
}
