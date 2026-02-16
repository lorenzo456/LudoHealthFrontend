import { createRouter, createWebHistory } from 'vue-router'
import Challenges from '@/views/Challenges.vue'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/challenges',
      name: 'challenges',
      component: Challenges,
    },
  ],
})

export default router
