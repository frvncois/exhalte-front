// Forward clones: [cover, span, title, cover0, details0, cover1, details1, ...]
// Reverse clones: [cover, span, title, cover0, info0, cover1, info1, ...]

let fwdClones: HTMLElement[] = []
let revClones: HTMLElement[] = []
let clickedIndex = -1

function getLenisScrollOffset(): number {
    const matrix = new DOMMatrix(window.getComputedStyle(document.documentElement).transform)
    return -matrix.m42
}

function makeFixedClone(el: Element): HTMLElement {
    const rect = el.getBoundingClientRect()
    const scroll = getLenisScrollOffset()
    const clone = el.cloneNode(true) as HTMLElement
    Object.assign(clone.style, {
        position: 'fixed',
        top: `${rect.top + scroll}px`,
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

// RouteChange overlay callback
let routeChangeCallback: ((done: () => void, bg: string) => void) | null = null
export function registerRouteChange(cb: (done: () => void, bg: string) => void) { routeChangeCallback = cb }
export function triggerRouteChange(done: () => void, bg: string) {
    if (routeChangeCallback) routeChangeCallback(done, bg)
    else done()
}

let routeChangeOutCallback: (() => void) | null = null
export function registerRouteChangeOut(cb: () => void) { routeChangeOutCallback = cb }
export function triggerRouteChangeOut() { routeChangeOutCallback?.() }

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
