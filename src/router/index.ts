import { createRouter, createWebHistory } from 'vue-router'
import Challenges from '@/views/Challenges.vue'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue'
import Challenge from '@/views/Challenge.vue'
import Profile from '@/views/Profile.vue'

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
    {
      path: '/challenge/:id',
      name: 'challenge',
      component: Challenge,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
  ],
})

export default router
