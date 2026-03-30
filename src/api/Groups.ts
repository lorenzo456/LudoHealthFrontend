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

export const getAllGroups = async (): Promise<Group[]> => {
  const response = await apiClient.get('/admin/groups')
  return response.data as Group[]
}

export const updateGroup = async (
  groupId: number,
  data: Partial<Pick<Group, 'name' | 'description' | 'is_public'>>,
): Promise<Group> => {
  const response = await apiClient.patch(`/groups/${groupId}`, data)
  return response.data as Group
}

export const createGroup = async (data: {
  name: string
  description: string
  is_public: boolean
  created_by: number
}): Promise<Group> => {
  const response = await apiClient.post('/groups', data)
  return response.data as Group
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
