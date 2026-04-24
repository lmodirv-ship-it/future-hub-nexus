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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          project_id: string
          severity: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          project_id: string
          severity?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          project_id?: string
          severity?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_sites: {
        Row: {
          alert_email: string | null
          created_at: string
          id: string
          is_active: boolean
          is_up: boolean | null
          last_checked_at: string | null
          last_response_time_ms: number | null
          last_status_code: number | null
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          alert_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          alert_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          check_interval_minutes: number
          created_at: string
          description_ar: string | null
          description_en: string | null
          features: Json
          id: string
          interval: string
          is_active: boolean
          is_featured: boolean
          max_sites: number
          name_ar: string
          name_en: string
          paddle_price_id: string | null
          price_mad_cents: number
          price_usd_cents: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          check_interval_minutes?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          is_featured?: boolean
          max_sites?: number
          name_ar: string
          name_en: string
          paddle_price_id?: string | null
          price_mad_cents?: number
          price_usd_cents?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          check_interval_minutes?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          is_featured?: boolean
          max_sites?: number
          name_ar?: string
          name_en?: string
          paddle_price_id?: string | null
          price_mad_cents?: number
          price_usd_cents?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_checks: {
        Row: {
          checked_at: string
          error_message: string | null
          id: string
          is_up: boolean
          project_id: string
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          id?: string
          is_up: boolean
          project_id: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          id?: string
          is_up?: boolean
          project_id?: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      project_visits: {
        Row: {
          count: number
          created_at: string
          id: string
          project_id: string
          visit_date: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          project_id: string
          visit_date?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          project_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          category_label: string
          created_at: string
          description: string | null
          description_ar: string | null
          glow: string | null
          icon: string | null
          id: string
          is_featured: boolean
          is_up: boolean | null
          last_checked_at: string | null
          last_response_time_ms: number | null
          last_status_code: number | null
          lovable_project_id: string | null
          name: string
          name_ar: string
          owner_email: string | null
          slug: string
          sort_order: number
          status: string
          updated_at: string
          url: string
          visit_count: number
        }
        Insert: {
          category?: string
          category_label?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          glow?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          lovable_project_id?: string | null
          name: string
          name_ar: string
          owner_email?: string | null
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
          url: string
          visit_count?: number
        }
        Update: {
          category?: string
          category_label?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          glow?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          lovable_project_id?: string | null
          name?: string
          name_ar?: string
          owner_email?: string | null
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
          url?: string
          visit_count?: number
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      template_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          download_expires_at: string | null
          download_token: string | null
          id: string
          paddle_transaction_id: string | null
          status: string
          template_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_token?: string | null
          id?: string
          paddle_transaction_id?: string | null
          status?: string
          template_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_token?: string | null
          id?: string
          paddle_transaction_id?: string | null
          status?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string
          demo_url: string | null
          description_ar: string | null
          description_en: string | null
          download_count: number
          features: Json
          id: string
          is_published: boolean
          paddle_price_id: string | null
          price_mad_cents: number
          price_usd_cents: number
          slug: string
          sort_order: number
          source_project_id: string | null
          tech_stack: Json
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image?: string | null
          created_at?: string
          demo_url?: string | null
          description_ar?: string | null
          description_en?: string | null
          download_count?: number
          features?: Json
          id?: string
          is_published?: boolean
          paddle_price_id?: string | null
          price_mad_cents?: number
          price_usd_cents?: number
          slug: string
          sort_order?: number
          source_project_id?: string | null
          tech_stack?: Json
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string
          demo_url?: string | null
          description_ar?: string | null
          description_en?: string | null
          download_count?: number
          features?: Json
          id?: string
          is_published?: boolean
          paddle_price_id?: string | null
          price_mad_cents?: number
          price_usd_cents?: number
          slug?: string
          sort_order?: number
          source_project_id?: string | null
          tech_stack?: Json
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_source_project_id_fkey"
            columns: ["source_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_source_project_id_fkey"
            columns: ["source_project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      projects_public: {
        Row: {
          category: string | null
          category_label: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          glow: string | null
          icon: string | null
          id: string | null
          is_featured: boolean | null
          is_up: boolean | null
          last_checked_at: string | null
          last_response_time_ms: number | null
          last_status_code: number | null
          name: string | null
          name_ar: string | null
          slug: string | null
          sort_order: number | null
          status: string | null
          updated_at: string | null
          url: string | null
          visit_count: number | null
        }
        Insert: {
          category?: string | null
          category_label?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          glow?: string | null
          icon?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          name?: string | null
          name_ar?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          visit_count?: number | null
        }
        Update: {
          category?: string | null
          category_label?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          glow?: string | null
          icon?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_up?: boolean | null
          last_checked_at?: string | null
          last_response_time_ms?: number | null
          last_status_code?: number | null
          name?: string | null
          name_ar?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          visit_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_dashboard_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_project_visit: { Args: { _project_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "viewer"
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
      app_role: ["admin", "viewer"],
    },
  },
} as const
