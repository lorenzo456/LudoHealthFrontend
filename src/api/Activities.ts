import type { Activity } from '@/types/Activity'
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
