export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      machine_products: {
        Row: {
          created_at: string
          current_stock: number
          id: number
          last_restocked: string | null
          machine_id: number | null
          max_capacity: number
          product_id: number | null
          slot_index: number
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: number
          last_restocked?: string | null
          machine_id?: number | null
          max_capacity?: number
          product_id?: number | null
          slot_index: number
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: number
          last_restocked?: string | null
          machine_id?: number | null
          max_capacity?: number
          product_id?: number | null
          slot_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "machine_products_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number | null
          created_at: string
          date_paid: string | null
          id: number
          machine_command: string | null
          machine_id: number | null
          machine_product_id: number | null
          product_category: string | null
          product_name: string | null
          product_sku: string | null
          slot_index: number | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          date_paid?: string | null
          id?: number
          machine_command?: string | null
          machine_id?: number | null
          machine_product_id?: number | null
          product_category?: string | null
          product_name?: string | null
          product_sku?: string | null
          slot_index?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          date_paid?: string | null
          id?: number
          machine_command?: string | null
          machine_id?: number | null
          machine_product_id?: number | null
          product_category?: string | null
          product_name?: string | null
          product_sku?: string | null
          slot_index?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_machine_product_id_fkey"
            columns: ["machine_product_id"]
            isOneToOne: false
            referencedRelation: "machine_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales_by_day: {
        Row: {
          amount: number | null
          created_at: string
          day: string | null
          id: number
          machine_id: number | null
          num_sales: number | null
          product_id: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          day?: string | null
          id?: number
          machine_id?: number | null
          num_sales?: number | null
          product_id?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          day?: string | null
          id?: number
          machine_id?: number | null
          num_sales?: number | null
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_by_day_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_by_day_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          id: number
          image: string | null
          name: string
          price: number
          sku: string
          stock: number
          unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
          image?: string | null
          name: string
          price: number
          sku: string
          stock: number
          unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
          image?: string | null
          name?: string
          price?: number
          sku?: string
          stock?: number
          unit?: string | null
        }
        Relationships: []
      }
      vending_machines: {
        Row: {
          baud_rate: number
          created_at: string
          data_bits: number
          description: string | null
          device_path: string
          id: number
          last_seen: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          num_slots: number
          parity: number
          serial_number: string
          status: Database["public"]["Enums"]["machine_status"]
          stop_bits: number
          support_contacts: string | null
          target_temperature: number
          technician_password: string | null
          temperature: number | null
        }
        Insert: {
          baud_rate?: number
          created_at?: string
          data_bits?: number
          description?: string | null
          device_path?: string
          id?: number
          last_seen?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          num_slots?: number
          parity?: number
          serial_number: string
          status?: Database["public"]["Enums"]["machine_status"]
          stop_bits?: number
          support_contacts?: string | null
          target_temperature?: number
          technician_password?: string | null
          temperature?: number | null
        }
        Update: {
          baud_rate?: number
          created_at?: string
          data_bits?: number
          description?: string | null
          device_path?: string
          id?: number
          last_seen?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          num_slots?: number
          parity?: number
          serial_number?: string
          status?: Database["public"]["Enums"]["machine_status"]
          stop_bits?: number
          support_contacts?: string | null
          target_temperature?: number
          technician_password?: string | null
          temperature?: number | null
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
      machine_status: "online" | "offline"
      order_status: "created" | "paid" | "failed" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      machine_status: ["online", "offline"],
      order_status: ["created", "paid", "failed", "cancelled"],
    },
  },
} as const

