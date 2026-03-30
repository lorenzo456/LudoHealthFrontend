export interface Group {
  id: number
  name: string
  description: string | null
  is_public: number
  created_at: string
  created_by: number
  joined_at?: string
}
