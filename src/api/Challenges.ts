import apiClient from './apiclient'
import type { Challenge } from '@/types/Challenge'
import type { Task, TaskProperty } from '@/types/Task'

export const getPlayerChallenges = async (playerId: number): Promise<Challenge[]> => {
  try {
    const response = await apiClient.get(`/players/${playerId}/challenges`)
    return response.data as Challenge[]
  } catch (error) {
    console.error(`Error fetching challenges for player ${playerId}:`, error)
    throw error
  }
}

export const getChallengeById = async (id: number): Promise<Challenge> => {
  try {
    const response = await apiClient.get(`/challenges/${id}`)
    return response.data as Challenge
  } catch (error) {
    console.error(`Error fetching challenge ${id}:`, error)
    throw error
  }
}

export const getChallengeTasks = async (challengeId: number): Promise<Task[]> => {
  try {
    const response = await apiClient.get(`/challenges/${challengeId}/tasks`)
    return response.data as Task[]
  } catch (error) {
    console.error(`Error fetching tasks for challenge ${challengeId}:`, error)
    throw error
  }
}

export const getTaskProperties = async (taskId: number): Promise<TaskProperty[]> => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}/properties`)
    return response.data as TaskProperty[]
  } catch (error) {
    console.error(`Error fetching properties for task ${taskId}:`, error)
    throw error
  }
}

export const getChallengeProgress = async (
  playerId: number,
): Promise<{ challenge_id: number; total_tasks: number; completed_tasks: number }[]> => {
  try {
    const response = await apiClient.get(`/players/${playerId}/challenge-progress`)
    return response.data
  } catch (error) {
    console.error(`Error fetching challenge progress for player ${playerId}:`, error)
    throw error
  }
}

export const getCompletedChallenges = async (
  playerId: number,
): Promise<{ challenge_id: number; name: string; category: string; points: number; total_tasks: number; completed_at: string }[]> => {
  const response = await apiClient.get(`/players/${playerId}/completed-challenges`)
  return response.data
}

export const getTaskCompletions = async (
  challengeId: number,
  playerId: number,
): Promise<{ task_id: number; completions_today: number }[]> => {
  try {
    const response = await apiClient.get(`/challenges/${challengeId}/completions`, {
      params: { player_id: playerId },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching completions for challenge ${challengeId}:`, error)
    throw error
  }
}
