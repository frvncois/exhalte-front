<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const sectionRef = ref(null)
const track = ref(null)
let observer = null

onMounted(() => {
    const lis = track.value?.querySelectorAll('li')
    if (!lis) return

    lis.forEach(li => {
        gsap.set(li.querySelector('.cover'), { clipPath: 'inset(0 0 100% 0)' })
        gsap.set(li.querySelector('.details'), { opacity: 0 })
    })

    observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        lis.forEach((li, i) => {
            const delay = i * 0.12
            gsap.to(li.querySelector('.cover'), { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out', delay })
            gsap.to(li.querySelector('.details'), { opacity: 1, duration: 0.8, ease: 'power2.out', delay: delay + 0.3 })
        })
        observer?.disconnect()
    }, { threshold: 0.1 })

    observer.observe(sectionRef.value)
})

onUnmounted(() => observer?.disconnect())
let isDragging = false
let startX = 0
let scrollLeft = 0
let dragDistance = 0

function onMouseDown(e) {
    isDragging = true
    dragDistance = 0
    startX = e.pageX - track.value.offsetLeft
    scrollLeft = track.value.scrollLeft
    track.value.style.cursor = 'grabbing'
}

function onMouseMove(e) {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - track.value.offsetLeft
    const delta = x - startX
    dragDistance = Math.abs(delta)
    track.value.scrollLeft = scrollLeft - delta
}

function onMouseUp(e) {
    isDragging = false
    track.value.style.cursor = 'grab'
}

function onClick(e) {
    // Suppress click if it was actually a drag
    if (dragDistance > 5) e.stopPropagation()
}
</script>

<template>
    <section ref="sectionRef">
        <ul
            ref="track"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @click.capture="onClick"
        >
            <li v-for="n in 6" :key="n" @click="$router.push('/single')">
                <div class="cover"></div>
                <div class="details">
                    <span>01</span>
                    <div class="title">
                        <h2>Project Title</h2>
                        <p>Project Description</p>
                    </div>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
section {
    overflow: hidden;
    width: 100vw;
    padding: 2em;
}

ul {
    display: flex;
    gap: 1.5em;
    list-style: none;
    margin: 0;
    --visible: 3.25;
    --gap: 1.5rem;
    overflow-x: scroll;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
}

ul::-webkit-scrollbar {
    display: none;
}

li {
    flex: 0 0 calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible));
    display: flex;
    gap: 0.75rem;
    cursor: pointer;
}

.cover {
    background-color: black;
    aspect-ratio: 4 / 3;
    width: 100%;
    flex: 1;
}

.details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.25rem;
    flex: 1;
}

@media (max-width: 768px) {
    ul {
        --visible: 1.25;
    }
}
</style>
