import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      registrations: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          phone: string
          course: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          phone: string
          course: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          phone?: string
          course?: string
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          phone_number: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string
          created_at?: string
        }
      }
      courses_ats: {
        Row: {
          id: string
          created_at: string
          title: string | null
          type: string | null
          description: string | null
          level: string | null
          age_requirement: number | null
          experience_requirement: string | null
          equipment_requirement: string | null
          document_requirement: string | null
          suggested_preparation: string | null
          price: number | null
          currency: string | null
          duration: string | null
          max_students: number | null
          start_date: string | null
          whats_included: any
          is_active: boolean | null
          is_online: boolean | null
          practice_exam_time_limit: number | null
          practice_exam_question_count: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title?: string | null
          type?: string | null
          description?: string | null
          level?: string | null
          age_requirement?: number | null
          experience_requirement?: string | null
          equipment_requirement?: string | null
          document_requirement?: string | null
          suggested_preparation?: string | null
          price?: number | null
          currency?: string | null
          duration?: string | null
          max_students?: number | null
          start_date?: string | null
          whats_included?: any
          is_active?: boolean | null
          is_online?: boolean | null
          practice_exam_time_limit?: number | null
          practice_exam_question_count?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string | null
          type?: string | null
          description?: string | null
          level?: string | null
          age_requirement?: number | null
          experience_requirement?: string | null
          equipment_requirement?: string | null
          document_requirement?: string | null
          suggested_preparation?: string | null
          price?: number | null
          currency?: string | null
          duration?: string | null
          max_students?: number | null
          start_date?: string | null
          whats_included?: any
          is_active?: boolean | null
          is_online?: boolean | null
          practice_exam_time_limit?: number | null
          practice_exam_question_count?: number | null
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
    }
  }
  student_module_progress: {
    Row: {
      id: string
      student_id: string
      course_id: string
      module_id: string
      completed: boolean
      completed_at: string
      created_at: string
    }
    Insert: {
      id?: string
      student_id: string
      course_id: string
      module_id: string
      completed?: boolean
      completed_at?: string
      created_at?: string
    }
    Update: {
      id?: string
      student_id?: string
      course_id?: string
      module_id?: string
      completed?: boolean
      completed_at?: string
      created_at?: string
    }
  }
  ats_course_modules: {
    Row: {
      id: string
      course_id: string
      title: string
      description: string | null
      order: number
      created_at: string
    }
    Insert: {
      id?: string
      course_id: string
      title: string
      description?: string | null
      order?: number
      created_at?: string
    }
    Update: {
      id?: string
      course_id?: string
      title?: string
      description?: string | null
      order?: number
      created_at?: string
    }
  }
  ats_module_lessons: {
    Row: {
      id: string
      module_id: string
      title: string
      content: string | null
      order: number
      type: string
      created_at: string
    }
    Insert: {
      id?: string
      module_id: string
      title: string
      content?: string | null
      order?: number
      type?: string
      created_at?: string
    }
    Update: {
      id?: string
      module_id?: string
      title?: string
      content?: string | null
      order?: number
      type?: string
      created_at?: string
    }
  }
}