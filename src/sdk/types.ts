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
      boops: {
        Row: {
          emoji: string
          event_id: string
          id: string
          recipient_id: string
          sender_id: string
          sent_at: string | null
        }
        Insert: {
          emoji: string
          event_id: string
          id?: string
          recipient_id: string
          sender_id: string
          sent_at?: string | null
        }
        Update: {
          emoji?: string
          event_id?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boops_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          event_id: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          event_id: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          background_color: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_at: string | null
          host_id: string
          id: string
          invite_link_token: string
          is_plus_ones_allowed: boolean | null
          location: string | null
          max_capacity: number | null
          music_url: string | null
          rsvp_button_style: string | null
          show_guest_list: boolean | null
          start_at: string
          theme: string | null
          title: string
          visibility: string | null
        }
        Insert: {
          background_color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          host_id: string
          id?: string
          invite_link_token?: string
          is_plus_ones_allowed?: boolean | null
          location?: string | null
          max_capacity?: number | null
          music_url?: string | null
          rsvp_button_style?: string | null
          show_guest_list?: boolean | null
          start_at: string
          theme?: string | null
          title: string
          visibility?: string | null
        }
        Update: {
          background_color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          host_id?: string
          id?: string
          invite_link_token?: string
          is_plus_ones_allowed?: boolean | null
          location?: string | null
          max_capacity?: number | null
          music_url?: string | null
          rsvp_button_style?: string | null
          show_guest_list?: boolean | null
          start_at?: string
          theme?: string | null
          title?: string
          visibility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          headcount: number | null
          id: string
          note: string | null
          plus_ones: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          headcount?: number | null
          id?: string
          note?: string | null
          plus_ones?: number | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          headcount?: number | null
          id?: string
          note?: string | null
          plus_ones?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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

// Convenience type aliases
export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type Rsvp = Database['public']['Tables']['rsvps']['Row']
export type RsvpInsert = Database['public']['Tables']['rsvps']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type EventPost = Database['public']['Tables']['event_posts']['Row']
export type EventPostInsert = Database['public']['Tables']['event_posts']['Insert']
export type Boop = Database['public']['Tables']['boops']['Row']
export type BoopInsert = Database['public']['Tables']['boops']['Insert']
export type RsvpStatus = 'yes' | 'no' | 'maybe'
export type RsvpButtonStyle = 'default' | 'emoji' | 'spooky' | 'flirty' | 'formal' | 'hype' | 'icons'

export type RsvpWithProfile = Rsvp & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null
}
