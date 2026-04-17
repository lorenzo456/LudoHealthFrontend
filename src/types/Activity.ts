export interface ActivityProperty {
  activity_property_id: number
  value: number | string
}

export interface CreateActivityPayload {
  player_id: number
  activity_type_id: number
  task_id?: number
  properties: ActivityProperty[]
  source?: string
  created_at?: string
  points?: number
}

export interface ActivityDisplayProperty {
  name: string
  value: number
  unit: string
}

export interface Activity {
  id: number
  created_at: string
  source: string
  points: number
  activity_type_name: string
  properties: ActivityDisplayProperty[]
}
