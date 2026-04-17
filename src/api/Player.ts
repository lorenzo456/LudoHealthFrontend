import type { Player } from '@/types/Player'
import apiClient from './apiclient'

export const getPlayer = async (playerId: number): Promise<Player> => {
  try {
    const response = await apiClient.get(`/players/${playerId}`)
    return response.data as Player
  } catch (error) {
    console.error(`Error fetching player with id ${playerId}:`, error)
    throw error
  }
}

