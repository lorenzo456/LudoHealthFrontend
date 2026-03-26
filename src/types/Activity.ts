export interface ActivityProperty {
  activity_property_id: number
  value: number | string
}

export interface CreateActivityPayload {
  player_id: number
  device_id: number
  activity_type_id: number
  properties: ActivityProperty[]
}

export interface ActivityDisplayProperty {
  name: string
  value: number
  unit: string
}

export interface Activity {
  id: number
  created_at: string
  device_name: string
  activity_type_name: string
  properties: ActivityDisplayProperty[]
}
