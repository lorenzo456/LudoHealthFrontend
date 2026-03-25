export interface Rule {
  id: number
  challenge_id: number
  activity_type_id: number
  rules: string
  category: string
  description: string
  unit: string
  points: number
  name: string
  max_frequency: number
  device_id: number
  properties: Property[]
}
export interface Property {
  activity_property_id: number
  name: string
  unit: string
}
