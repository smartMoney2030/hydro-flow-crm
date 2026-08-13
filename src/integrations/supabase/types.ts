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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          at: string
          created_at: string
          detail: string | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action?: string
          actor_id?: string | null
          at?: string
          created_at?: string
          detail?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          at?: string
          created_at?: string
          detail?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          created_at: string
          effect: string
          enabled: boolean
          id: string
          last_run_at: string | null
          name: string
          runs_today: number
          trigger: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effect?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          name?: string
          runs_today?: number
          trigger?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effect?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          name?: string
          runs_today?: number
          trigger?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          at: string
          created_at: string
          detail: string | null
          id: string
          rule_id: string | null
          status: string
        }
        Insert: {
          at?: string
          created_at?: string
          detail?: string | null
          id?: string
          rule_id?: string | null
          status?: string
        }
        Update: {
          at?: string
          created_at?: string
          detail?: string | null
          id?: string
          rule_id?: string | null
          status?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          customer_id: string | null
          end_at: string | null
          id: string
          notes: string | null
          related_id: string | null
          start_at: string | null
          technician_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          customer_id?: string | null
          end_at?: string | null
          id?: string
          notes?: string | null
          related_id?: string | null
          start_at?: string | null
          technician_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          customer_id?: string | null
          end_at?: string | null
          id?: string
          notes?: string | null
          related_id?: string | null
          start_at?: string | null
          technician_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          assigned_salesperson_id: string | null
          assigned_technician_id: string | null
          billing_address: string
          created_at: string
          documents: Json
          email: string
          enrolled_in_maintenance: boolean
          first_name: string
          id: string
          import_batch_id: string | null
          is_historical: boolean
          last_name: string
          lat: number
          lead_source: string
          lng: number
          notes: string
          original_install_date: string | null
          original_sale_date: string | null
          payment_status: string | null
          phone: string
          photos: Json
          preferred_contact: string
          previous_service_history: string | null
          property_address: string
          purchase_price: number | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          assigned_salesperson_id?: string | null
          assigned_technician_id?: string | null
          billing_address?: string
          created_at?: string
          documents?: Json
          email?: string
          enrolled_in_maintenance?: boolean
          first_name?: string
          id?: string
          import_batch_id?: string | null
          is_historical?: boolean
          last_name?: string
          lat?: number
          lead_source?: string
          lng?: number
          notes?: string
          original_install_date?: string | null
          original_sale_date?: string | null
          payment_status?: string | null
          phone?: string
          photos?: Json
          preferred_contact?: string
          previous_service_history?: string | null
          property_address?: string
          purchase_price?: number | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          assigned_salesperson_id?: string | null
          assigned_technician_id?: string | null
          billing_address?: string
          created_at?: string
          documents?: Json
          email?: string
          enrolled_in_maintenance?: boolean
          first_name?: string
          id?: string
          import_batch_id?: string | null
          is_historical?: boolean
          last_name?: string
          lat?: number
          lead_source?: string
          lng?: number
          notes?: string
          original_install_date?: string | null
          original_sale_date?: string | null
          payment_status?: string | null
          phone?: string
          photos?: Json
          preferred_contact?: string
          previous_service_history?: string | null
          property_address?: string
          purchase_price?: number | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          install_date: string | null
          last_maintenance: string | null
          model: string
          next_maintenance: string | null
          notes: string
          serial: string
          status: string
          type: string
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          install_date?: string | null
          last_maintenance?: string | null
          model?: string
          next_maintenance?: string | null
          notes?: string
          serial?: string
          status?: string
          type?: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          install_date?: string | null
          last_maintenance?: string | null
          model?: string
          next_maintenance?: string | null
          notes?: string
          serial?: string
          status?: string
          type?: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_catalog: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          sizes: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          sizes?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          sizes?: Json
          updated_at?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          actor_id: string | null
          counts: Json
          created_at: string
          customer_ids: Json
          equipment_ids: Json
          event_ids: Json
          filename: string | null
          id: string
          lead_ids: Json
          maintenance_ids: Json
          reversed_at: string | null
          source: string
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          counts?: Json
          created_at?: string
          customer_ids?: Json
          equipment_ids?: Json
          event_ids?: Json
          filename?: string | null
          id?: string
          lead_ids?: Json
          maintenance_ids?: Json
          reversed_at?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          counts?: Json
          created_at?: string
          customer_ids?: Json
          equipment_ids?: Json
          event_ids?: Json
          filename?: string | null
          id?: string
          lead_ids?: Json
          maintenance_ids?: Json
          reversed_at?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      installations: {
        Row: {
          address: string
          after_photos: number
          before_photos: number
          completed_at: string | null
          created_at: string
          customer_id: string | null
          end_at: string | null
          equipment: Json
          follow_up_required: boolean
          id: string
          instructions: string
          job_id: string | null
          serials: Json
          signature_captured: boolean
          start_at: string | null
          status: string
          technician_id: string | null
          technician_notes: string
          updated_at: string
        }
        Insert: {
          address?: string
          after_photos?: number
          before_photos?: number
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          end_at?: string | null
          equipment?: Json
          follow_up_required?: boolean
          id?: string
          instructions?: string
          job_id?: string | null
          serials?: Json
          signature_captured?: boolean
          start_at?: string | null
          status?: string
          technician_id?: string | null
          technician_notes?: string
          updated_at?: string
        }
        Update: {
          address?: string
          after_photos?: number
          before_photos?: number
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          end_at?: string | null
          equipment?: Json
          follow_up_required?: boolean
          id?: string
          instructions?: string
          job_id?: string | null
          serials?: Json
          signature_captured?: boolean
          start_at?: string | null
          status?: string
          technician_id?: string | null
          technician_notes?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          on_hand: number
          reorder_level: number
          reorder_qty: number
          sku: string
          unit: string
          unit_cost: number | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          on_hand?: number
          reorder_level?: number
          reorder_qty?: number
          sku?: string
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          on_hand?: number
          reorder_level?: number
          reorder_qty?: number
          sku?: string
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          addons: Json
          created_at: string
          customer_id: string | null
          deposit_collected: number
          deposit_required: number
          id: string
          invoice_number: string
          lead_id: string | null
          notes: string
          payment_status: string
          products: Json
          sale_date: string | null
          salesperson_id: string | null
          status: string
          system_type: string
          total_price: number
          updated_at: string
        }
        Insert: {
          addons?: Json
          created_at?: string
          customer_id?: string | null
          deposit_collected?: number
          deposit_required?: number
          id?: string
          invoice_number?: string
          lead_id?: string | null
          notes?: string
          payment_status?: string
          products?: Json
          sale_date?: string | null
          salesperson_id?: string | null
          status?: string
          system_type?: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          addons?: Json
          created_at?: string
          customer_id?: string | null
          deposit_collected?: number
          deposit_required?: number
          id?: string
          invoice_number?: string
          lead_id?: string | null
          notes?: string
          payment_status?: string
          products?: Json
          sale_date?: string | null
          salesperson_id?: string | null
          status?: string
          system_type?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          current_equipment: string
          customer_id: string | null
          follow_up_at: string | null
          id: string
          lost_reason: string | null
          notes: string
          quote_amount: number | null
          quote_status: string
          sales_call_at: string | null
          status: string
          updated_at: string
          water_concerns: Json
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          current_equipment?: string
          customer_id?: string | null
          follow_up_at?: string | null
          id?: string
          lost_reason?: string | null
          notes?: string
          quote_amount?: number | null
          quote_status?: string
          sales_call_at?: string | null
          status?: string
          updated_at?: string
          water_concerns?: Json
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          current_equipment?: string
          customer_id?: string | null
          follow_up_at?: string | null
          id?: string
          lost_reason?: string | null
          notes?: string
          quote_amount?: number | null
          quote_status?: string
          sales_call_at?: string | null
          status?: string
          updated_at?: string
          water_concerns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_visits: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string | null
          due_date: string | null
          equipment_id: string | null
          id: string
          next_due_date: string | null
          notes: string
          parts_used: Json
          payment_status: string
          scheduled_at: string | null
          status: string
          technician_id: string | null
          updated_at: string
          work_performed: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string
          parts_used?: Json
          payment_status?: string
          scheduled_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          work_performed?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string
          parts_used?: Json
          payment_status?: string
          scheduled_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          href: string | null
          id: string
          kind: string
          read: boolean
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read?: boolean
          title?: string
        }
        Update: {
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read?: boolean
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          avatar_color: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_color?: string
          created_at?: string
          email?: string | null
          id: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_color?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      supply_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string
          expected_delivery: string | null
          id: string
          job_id: string | null
          line_items: Json
          notes: string
          order_date: string | null
          status: string
          tracking: string | null
          updated_at: string
          vendor: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          expected_delivery?: string | null
          id?: string
          job_id?: string | null
          line_items?: Json
          notes?: string
          order_date?: string | null
          status?: string
          tracking?: string | null
          updated_at?: string
          vendor?: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          expected_delivery?: string | null
          id?: string
          job_id?: string | null
          line_items?: Json
          notes?: string
          order_date?: string | null
          status?: string
          tracking?: string | null
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          done: boolean
          due_at: string | null
          id: string
          priority: string
          related_customer_id: string | null
          related_job_id: string | null
          related_lead_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_at?: string | null
          id?: string
          priority?: string
          related_customer_id?: string | null
          related_job_id?: string | null
          related_lead_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_at?: string | null
          id?: string
          priority?: string
          related_customer_id?: string | null
          related_job_id?: string | null
          related_lead_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "salesperson" | "scheduler" | "technician"
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
      app_role: ["admin", "salesperson", "scheduler", "technician"],
    },
  },
} as const
