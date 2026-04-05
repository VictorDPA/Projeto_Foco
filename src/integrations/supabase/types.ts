export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agenda_slots: {
        Row: {
          actual_duration_minutes: number | null
          block_id: string
          completed_at: string | null
          created_at: string
          day_of_week: number
          duration_minutes: number
          id: string
          is_completed: boolean
          slot_order: number
          slot_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          block_id: string
          completed_at?: string | null
          created_at?: string
          day_of_week: number
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          slot_order?: number
          slot_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          block_id?: string
          completed_at?: string | null
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          slot_order?: number
          slot_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_slots_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "study_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_agenda: {
        Row: {
          available_hours: number
          created_at: string
          day_of_week: number
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          available_hours?: number
          created_at?: string
          day_of_week: number
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          available_hours?: number
          created_at?: string
          day_of_week?: number
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      error_log: {
        Row: {
          created_at: string
          error_type: string
          exported: boolean | null
          id: string
          review_count: number | null
          subject_id: string
          topic: string
          trap: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_type: string
          exported?: boolean | null
          id?: string
          review_count?: number | null
          subject_id: string
          topic: string
          trap: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_type?: string
          exported?: boolean | null
          id?: string
          review_count?: number | null
          subject_id?: string
          topic?: string
          trap?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_log_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      law_articles: {
        Row: {
          article_number: string
          created_at: string
          description: string | null
          heat_map_status: string | null
          id: string
          is_mastered: boolean | null
          is_read: boolean | null
          law_name: string
          subject_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_number: string
          created_at?: string
          description?: string | null
          heat_map_status?: string | null
          id?: string
          is_mastered?: boolean | null
          is_read?: boolean | null
          law_name: string
          subject_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_number?: string
          created_at?: string
          description?: string | null
          heat_map_status?: string | null
          id?: string
          is_mastered?: boolean | null
          is_read?: boolean | null
          law_name?: string
          subject_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "law_articles_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      question_sessions: {
        Row: {
          block_id: string
          created_at: string
          exam_board: string | null
          hits: number
          id: string
          session_date: string
          total_questions: number
          user_id: string | null
        }
        Insert: {
          block_id: string
          created_at?: string
          exam_board?: string | null
          hits: number
          id?: string
          session_date: string
          total_questions: number
          user_id?: string | null
        }
        Update: {
          block_id?: string
          created_at?: string
          exam_board?: string | null
          hits?: number
          id?: string
          session_date?: string
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_sessions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "study_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      study_blocks: {
        Row: {
          created_at: string
          current_page: number | null
          description: string | null
          external_links: Json | null
          favoritos_url: string | null
          hours_studied: number | null
          id: string
          is_current: boolean | null
          name: string
          pdf_questions_done: number | null
          pdf_questions_total: number | null
          questoes_url: string | null
          redo_favorites: boolean | null
          status: string
          subject_id: string
          total_pages: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_page?: number | null
          description?: string | null
          external_links?: Json | null
          favoritos_url?: string | null
          hours_studied?: number | null
          id?: string
          is_current?: boolean | null
          name: string
          pdf_questions_done?: number | null
          pdf_questions_total?: number | null
          questoes_url?: string | null
          redo_favorites?: boolean | null
          status?: string
          subject_id: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_page?: number | null
          description?: string | null
          external_links?: Json | null
          favoritos_url?: string | null
          hours_studied?: number | null
          id?: string
          is_current?: boolean | null
          name?: string
          pdf_questions_done?: number | null
          pdf_questions_total?: number | null
          questoes_url?: string | null
          redo_favorites?: boolean | null
          status?: string
          subject_id?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_blocks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          block_id: string | null
          created_at: string
          id: string
          name: string
          reading_progress: number | null
          subject_id: string | null
          type: string
          url: string
          user_id: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          id?: string
          name: string
          reading_progress?: number | null
          subject_id?: string | null
          type: string
          url: string
          user_id?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string
          id?: string
          name?: string
          reading_progress?: number | null
          subject_id?: string | null
          type?: string
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "study_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_time_sessions: {
        Row: {
          block_id: string
          created_at: string
          duration_seconds: number
          id: string
          session_date: string
          user_id: string | null
        }
        Insert: {
          block_id: string
          created_at?: string
          duration_seconds?: number
          id?: string
          session_date?: string
          user_id?: string | null
        }
        Update: {
          block_id?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          session_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_time_sessions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "study_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          favoritos_url: string | null
          id: string
          monthly_giro: Json | null
          name: string
          study_phase: string | null
          tec_caderno_link: string | null
          updated_at: string
          user_id: string | null
          weight: number
        }
        Insert: {
          color?: string
          created_at?: string
          favoritos_url?: string | null
          id?: string
          monthly_giro?: Json | null
          name: string
          study_phase?: string | null
          tec_caderno_link?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: number
        }
        Update: {
          color?: string
          created_at?: string
          favoritos_url?: string | null
          id?: string
          monthly_giro?: Json | null
          name?: string
          study_phase?: string | null
          tec_caderno_link?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
