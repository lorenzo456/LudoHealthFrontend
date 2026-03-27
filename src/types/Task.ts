export interface TaskProperty {
  activity_property_id: number
  name: string
  unit: string
  activity_type_id: number
  threshold_value: number | null
  operator: string | null
}

export interface Task {
  id: number
  name: string
  description: string
  frequency: number
  challenge_id: number
  activity_type_id: number
  properties: TaskProperty[]
}
