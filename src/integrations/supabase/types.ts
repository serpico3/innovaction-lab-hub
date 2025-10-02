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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attivita: {
        Row: {
          created_at: string
          data: string
          descrizione: string | null
          formatore_id: string | null
          id: string
          orario: string
          scuola_id: string | null
          stato: string | null
          titolo: string
        }
        Insert: {
          created_at?: string
          data: string
          descrizione?: string | null
          formatore_id?: string | null
          id?: string
          orario: string
          scuola_id?: string | null
          stato?: string | null
          titolo: string
        }
        Update: {
          created_at?: string
          data?: string
          descrizione?: string | null
          formatore_id?: string | null
          id?: string
          orario?: string
          scuola_id?: string | null
          stato?: string | null
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "attivita_formatore_id_fkey"
            columns: ["formatore_id"]
            isOneToOne: false
            referencedRelation: "formatore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attivita_scuola_id_fkey"
            columns: ["scuola_id"]
            isOneToOne: false
            referencedRelation: "scuola"
            referencedColumns: ["id"]
          },
        ]
      }
      consumo: {
        Row: {
          attivita_id: string
          created_at: string
          id: string
          materiale_id: string
          quantita_usata: number
        }
        Insert: {
          attivita_id: string
          created_at?: string
          id?: string
          materiale_id: string
          quantita_usata: number
        }
        Update: {
          attivita_id?: string
          created_at?: string
          id?: string
          materiale_id?: string
          quantita_usata?: number
        }
        Relationships: [
          {
            foreignKeyName: "consumo_attivita_id_fkey"
            columns: ["attivita_id"]
            isOneToOne: false
            referencedRelation: "attivita"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_materiale_id_fkey"
            columns: ["materiale_id"]
            isOneToOne: false
            referencedRelation: "materiale"
            referencedColumns: ["id"]
          },
        ]
      }
      formatore: {
        Row: {
          created_at: string
          disponibilita: string | null
          id: string
          lezioni_concluse: number | null
          ore_totali: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          disponibilita?: string | null
          id?: string
          lezioni_concluse?: number | null
          ore_totali?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          disponibilita?: string | null
          id?: string
          lezioni_concluse?: number | null
          ore_totali?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatore_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materiale: {
        Row: {
          created_at: string
          descrizione: string | null
          id: string
          nome: string
          qr_code: string
          quantita_disponibile: number
          soglia_minima: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome: string
          qr_code: string
          quantita_disponibile?: number
          soglia_minima?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome?: string
          qr_code?: string
          quantita_disponibile?: number
          soglia_minima?: number
          updated_at?: string
        }
        Relationships: []
      }
      movimento: {
        Row: {
          created_at: string
          data_prelievo: string
          data_restituzione: string | null
          formatore_id: string
          id: string
          materiale_id: string
          quantita: number
          tipo_movimento: string
        }
        Insert: {
          created_at?: string
          data_prelievo?: string
          data_restituzione?: string | null
          formatore_id: string
          id?: string
          materiale_id: string
          quantita?: number
          tipo_movimento: string
        }
        Update: {
          created_at?: string
          data_prelievo?: string
          data_restituzione?: string | null
          formatore_id?: string
          id?: string
          materiale_id?: string
          quantita?: number
          tipo_movimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimento_formatore_id_fkey"
            columns: ["formatore_id"]
            isOneToOne: false
            referencedRelation: "formatore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimento_materiale_id_fkey"
            columns: ["materiale_id"]
            isOneToOne: false
            referencedRelation: "materiale"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cognome: string | null
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cognome?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          cognome?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      scuola: {
        Row: {
          contatto: string | null
          created_at: string
          email: string | null
          id: string
          indirizzo: string
          nome: string
        }
        Insert: {
          contatto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo: string
          nome: string
        }
        Update: {
          contatto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string
          nome?: string
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "amministratore" | "formatore" | "scuola"
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
      app_role: ["amministratore", "formatore", "scuola"],
    },
  },
} as const
