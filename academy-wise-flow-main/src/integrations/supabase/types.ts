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
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          progress_note: string | null
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          progress_note?: string | null
          status: string
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          progress_note?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_teacher_view"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string
          created_at: string
          date: string
          id: string
          rating: number
          student_id: string | null
          student_name: string
          subject: string
          teacher_name: string
        }
        Insert: {
          comment?: string
          created_at?: string
          date?: string
          id?: string
          rating: number
          student_id?: string | null
          student_name: string
          subject?: string
          teacher_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          date?: string
          id?: string
          rating?: number
          student_id?: string | null
          student_name?: string
          subject?: string
          teacher_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_teacher_view"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          class: string
          content: string
          created_at: string
          created_by: string | null
          created_by_name: string
          date: string
          id: string
          subject: string
          title: string
        }
        Insert: {
          class?: string
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          date?: string
          id?: string
          subject?: string
          title: string
        }
        Update: {
          class?: string
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          date?: string
          id?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string
          date: string
          description: string
          id: string
          is_emergency: boolean
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          date?: string
          description?: string
          id?: string
          is_emergency?: boolean
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          date?: string
          description?: string
          id?: string
          is_emergency?: boolean
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          class: string
          created_at: string
          dob: string
          id: string
          joining_date: string
          name: string
          paid_amount: number
          parent_phone: string
          school_name: string
          student_phone: string
          subjects: string
          total_fee: number
          user_id: string | null
        }
        Insert: {
          class: string
          created_at?: string
          dob: string
          id?: string
          joining_date?: string
          name: string
          paid_amount?: number
          parent_phone?: string
          school_name?: string
          student_phone?: string
          subjects?: string
          total_fee?: number
          user_id?: string | null
        }
        Update: {
          class?: string
          created_at?: string
          dob?: string
          id?: string
          joining_date?: string
          name?: string
          paid_amount?: number
          parent_phone?: string
          school_name?: string
          student_phone?: string
          subjects?: string
          total_fee?: number
          user_id?: string | null
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          class: string
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          subject: string
          title: string
          uploaded_by: string | null
          uploaded_by_name: string
        }
        Insert: {
          class?: string
          created_at?: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          subject?: string
          title: string
          uploaded_by?: string | null
          uploaded_by_name?: string
        }
        Update: {
          class?: string
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          subject?: string
          title?: string
          uploaded_by?: string | null
          uploaded_by_name?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          assigned_classes: string[]
          chapters_per_week: number
          completed_chapters: number
          created_at: string
          id: string
          name: string
          predicted_completion_date: string | null
          subject: string
          total_chapters: number
          user_id: string | null
        }
        Insert: {
          assigned_classes?: string[]
          chapters_per_week?: number
          completed_chapters?: number
          created_at?: string
          id?: string
          name: string
          predicted_completion_date?: string | null
          subject: string
          total_chapters?: number
          user_id?: string | null
        }
        Update: {
          assigned_classes?: string[]
          chapters_per_week?: number
          completed_chapters?: number
          created_at?: string
          id?: string
          name?: string
          predicted_completion_date?: string | null
          subject?: string
          total_chapters?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      students_teacher_view: {
        Row: {
          class: string | null
          created_at: string | null
          id: string | null
          joining_date: string | null
          name: string | null
          school_name: string | null
          subjects: string | null
          user_id: string | null
        }
        Insert: {
          class?: string | null
          created_at?: string | null
          id?: string | null
          joining_date?: string | null
          name?: string | null
          school_name?: string | null
          subjects?: string | null
          user_id?: string | null
        }
        Update: {
          class?: string | null
          created_at?: string | null
          id?: string | null
          joining_date?: string | null
          name?: string | null
          school_name?: string | null
          subjects?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
    Enums: {
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
