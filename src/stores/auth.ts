import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/apiclient'
import type { Player } from '@/types/Player'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const player = ref<Player | null>(JSON.parse(localStorage.getItem('player') ?? 'null'))

  const isLoggedIn = computed(() => !!token.value)

  function setSession(newToken: string, newPlayer: Player) {
    token.value = newToken
    player.value = newPlayer
    localStorage.setItem('token', newToken)
    localStorage.setItem('player', JSON.stringify(newPlayer))
  }

  function clearSession() {
    token.value = null
    player.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('player')
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password })
    setSession(response.data.token, response.data.player)
  }

  async function register(first_name: string, last_name: string, email: string, password: string) {
    const response = await apiClient.post('/auth/register', { first_name, last_name, email, password })
    setSession(response.data.token, response.data.player)
  }

  function logout() {
    clearSession()
  }

  return { token, player, isLoggedIn, login, register, logout }
})
