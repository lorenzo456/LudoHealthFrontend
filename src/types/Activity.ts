export interface ActivityProperty {
  activity_property_id: number
  value: number
}

export interface CreateActivityPayload {
  player_id: number
  device_id: number
  activity_type_id: number
  properties: ActivityProperty[]
}

export interface Activity {
  id: number
  value: number
  created_at: string
  name: string
  unit: string
  property: string
  device_name: string
  activity_type_name: string
  activity_type_id: number
}
