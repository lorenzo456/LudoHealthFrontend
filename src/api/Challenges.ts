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
