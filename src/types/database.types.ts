export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'viewer'
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'viewer'
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'viewer'
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          department_id: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          department_id: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          department_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      competencies: {
        Row: {
          id: string
          name: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      job_descriptions: {
        Row: {
          id: string
          position: string
          job_band: 'JB 1' | 'JB 2' | 'JB 3' | 'JB 4' | 'JB 5'
          job_grade: string
          location_id: string
          department_id: string
          team_id: string
          direct_supervisor: string
          job_purpose: string
          status: 'draft' | 'published' | 'archived'
          created_by: string
          updated_by: string
          version: number
          parent_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          position: string
          job_band: 'JB 1' | 'JB 2' | 'JB 3' | 'JB 4' | 'JB 5'
          job_grade: string
          location_id: string
          department_id: string
          team_id: string
          direct_supervisor: string
          job_purpose: string
          status?: 'draft' | 'published' | 'archived'
          created_by: string
          updated_by: string
          version?: number
          parent_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          position?: string
          job_band?: 'JB 1' | 'JB 2' | 'JB 3' | 'JB 4' | 'JB 5'
          job_grade?: string
          location_id?: string
          department_id?: string
          team_id?: string
          direct_supervisor?: string
          job_purpose?: string
          status?: 'draft' | 'published' | 'archived'
          created_by?: string
          updated_by?: string
          version?: number
          parent_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jd_responsibilities: {
        Row: {
          id: string
          jd_id: string
          category: 'key' | 'strategic' | 'team_management' | 'general' | 'culture' | 'efficiency'
          description: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          jd_id: string
          category: 'key' | 'strategic' | 'team_management' | 'general' | 'culture' | 'efficiency'
          description: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          jd_id?: string
          category?: 'key' | 'strategic' | 'team_management' | 'general' | 'culture' | 'efficiency'
          description?: string
          order_index?: number
          created_at?: string
        }
      }
      jd_risks: {
        Row: {
          id: string
          jd_id: string
          type: 'external' | 'internal'
          description: string
          risk_level: 'low' | 'medium' | 'high'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          jd_id: string
          type: 'external' | 'internal'
          description: string
          risk_level: 'low' | 'medium' | 'high'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          jd_id?: string
          type?: 'external' | 'internal'
          description?: string
          risk_level?: 'low' | 'medium' | 'high'
          order_index?: number
          created_at?: string
        }
      }
      jd_competencies: {
        Row: {
          id: string
          jd_id: string
          competency_id: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          jd_id: string
          competency_id: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          jd_id?: string
          competency_id?: string
          score?: number
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          target_user_id: string
          action: 'password_change' | 'role_change' | 'team_assign' | 'team_remove' | 'user_delete'
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_user_id: string
          action: 'password_change' | 'role_change' | 'team_assign' | 'team_remove' | 'user_delete'
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_user_id?: string
          action?: 'password_change' | 'role_change' | 'team_assign' | 'team_remove' | 'user_delete'
          details?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
