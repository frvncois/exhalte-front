import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ProjectType = 'video' | 'gallery'

export const useProjectStore = defineStore('project', () => {
    const type = ref<ProjectType>('video')
    function setType(t: ProjectType) { type.value = t }
    return { type, setType }
})
