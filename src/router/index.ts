import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Challenges from '@/views/Challenges.vue'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue'
import Challenge from '@/views/Challenge.vue'
import Profile from '@/views/Profile.vue'
import ChallengeCreation from '@/views/ChallengeCreation.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Groups from '@/views/Groups.vue'

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
      path: '/challenges/create',
      name: 'challenge-creation',
      component: ChallengeCreation,
      meta: { requiresAdmin: true },
    },
    {
      path: '/groups',
      name: 'groups',
      component: Groups,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
  ],
})

const publicRoutes = ['/login', '/register']

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn && !publicRoutes.includes(to.path)) {
    return '/login'
  }
  if (to.meta.requiresAdmin && auth.player?.role !== 'admin') {
    return '/'
  }
})

export default router
