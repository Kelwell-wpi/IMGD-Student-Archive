import { createRouter, createWebHistory } from 'vue-router'
import vfxGallery from '../components/vfxGallery.vue'
import ProjectDetail from '../components/ProjectDetail.vue'


const routes = [
  { 
    path: '/', 
    component: vfxGallery 
  },
  { 
    path: '/vfx', 
    component: vfxGallery 
  },
  { 
    path: '/project/:id', 
    component: ProjectDetail,
    props: true
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})