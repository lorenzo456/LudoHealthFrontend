import type { Activity, CreateActivityPayload } from '@/types/Activity'
import apiClient from './apiclient'

export const getUserActivities = async (userId: number): Promise<Activity[]> => {
  try {
    const response = await apiClient.get(`/activities/${userId}`)
    return response.data as Activity[]
  } catch (error) {
    console.error(`Error fetching activities for user with id ${userId}:`, error)
    throw error
  }
}

export const postActivity = async (payload: CreateActivityPayload): Promise<void> => {
  try {
    await apiClient.post('/activities', payload)
  } catch (error) {
    console.error('Error posting activity:', error)
    throw error
  }
}
