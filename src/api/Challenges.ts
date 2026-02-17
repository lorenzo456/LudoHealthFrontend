import type { Rule } from '@/types/Rule'
import apiClient from './apiclient'
import { type Challenge } from '@/types/Challenge'

export const getChallenges = async (): Promise<Challenge[]> => {
  try {
    const response = await apiClient.get('/challenges')
    return response.data as Challenge[]
  } catch (error) {
    console.error('Error fetching challenges:', error)
    throw error
  }
}

export const getChallengeById = async (id: number): Promise<Challenge> => {
  try {
    const response = await apiClient.get(`/challenges/${id}`)
    return response.data as Challenge
  } catch (error) {
    console.error(`Error fetching challenge with id ${id}:`, error)
    throw error
  }
}

export const getChallengeRules = async (id: number): Promise<Rule> => {
  try {
    const response = await apiClient.get(`/challenges/${id}/rules`)
    return response.data as Rule
  } catch (error) {
    console.error(`Error fetching rules for challenge with id ${id}:`, error)
    throw error
  }
}
