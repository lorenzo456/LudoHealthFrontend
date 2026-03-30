import apiClient from './apiclient'
import type { Group } from '@/types/Group'
import type { Challenge } from '@/types/Challenge'

export const getPlayerGroups = async (playerId: number): Promise<Group[]> => {
  const response = await apiClient.get(`/players/${playerId}/groups`)
  return response.data as Group[]
}

export const getPublicGroups = async (): Promise<Group[]> => {
  const response = await apiClient.get('/groups')
  return response.data as Group[]
}

export const joinGroup = async (groupId: number, playerId: number): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/players`, { player_id: playerId })
}

export const getGroupChallenges = async (groupId: number): Promise<Challenge[]> => {
  const response = await apiClient.get(`/groups/${groupId}/challenges`)
  return response.data as Challenge[]
}

export const getGroupProgress = async (
  groupId: number,
  playerId: number,
): Promise<{ challenge_id: number; total_tasks: number; completed_tasks: number }[]> => {
  const response = await apiClient.get(`/groups/${groupId}/progress`, { params: { player_id: playerId } })
  return response.data
}
