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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      account_plugins: {
        Row: {
          account_id: string
          created_at: string | null
          credentials: Json | null
          deleted_on: string | null
          id: string
          plugin_id: string
          provider_id: string | null
          status: Database["public"]["Enums"]["plugin_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credentials?: Json | null
          deleted_on?: string | null
          id?: string
          plugin_id: string
          provider_id?: string | null
          status?: Database["public"]["Enums"]["plugin_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credentials?: Json | null
          deleted_on?: string | null
          id?: string
          plugin_id?: string
          provider_id?: string | null
          status?: Database["public"]["Enums"]["plugin_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_plugins_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_plugins_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_plugins_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_on: string | null
          email: string | null
          id: string
          loom_app_id: string | null
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_on?: string | null
          email?: string | null
          id?: string
          loom_app_id?: string | null
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_on?: string | null
          email?: string | null
          id?: string
          loom_app_id?: string | null
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_memberships: {
        Row: {
          account_role: string
          created_at: string
          created_by: string | null
          organization_id: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          account_role?: string
          created_at?: string
          created_by?: string | null
          organization_id: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          account_role?: string
          created_at?: string
          created_by?: string | null
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_memberships_account_role_fkey"
            columns: ["account_role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "accounts_memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "accounts_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          action: Database["public"]["Enums"]["action_type"]
          actor: string
          created_at: string
          id: number
          message: string
          order_id: number
          preposition: string
          previous_value: string | null
          temp_id: string | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
          value: string
        }
        Insert: {
          action: Database["public"]["Enums"]["action_type"]
          actor: string
          created_at?: string
          id?: number
          message: string
          order_id: number
          preposition: string
          previous_value?: string | null
          temp_id?: string | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
          value: string
        }
        Update: {
          action?: Database["public"]["Enums"]["action_type"]
          actor?: string
          created_at?: string
          id?: number
          message?: string
          order_id?: number
          preposition?: string
          previous_value?: string | null
          temp_id?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_statuses: {
        Row: {
          agency_id: string | null
          created_at: string
          deleted_on: string | null
          id: number
          position: number | null
          status_color: string | null
          status_name: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: number
          position?: number | null
          status_color?: string | null
          status_name?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: number
          position?: number | null
          status_color?: string | null
          status_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_statuses_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_statuses_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agency_statuses_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          created_at: string | null
          deleted_on: string | null
          file_id: string
          id: string
          message_id: string | null
          number: number | null
          page_number: number | null
          position_x: number | null
          position_y: number | null
          status: Database["public"]["Enums"]["annotations_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_on?: string | null
          file_id: string
          id?: string
          message_id?: string | null
          number?: number | null
          page_number?: number | null
          position_x?: number | null
          position_y?: number | null
          status?: Database["public"]["Enums"]["annotations_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_on?: string | null
          file_id?: string
          id?: string
          message_id?: string | null
          number?: number | null
          page_number?: number | null
          position_x?: number | null
          position_y?: number | null
          status?: Database["public"]["Enums"]["annotations_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_accounts: {
        Row: {
          account_id: string
          created_at: string
          credentials: Json | null
          deleted_on: string | null
          id: string
          namespace: string
          provider: Database["public"]["Enums"]["billing_provider"]
          provider_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credentials?: Json | null
          deleted_on?: string | null
          id?: string
          namespace?: string
          provider?: Database["public"]["Enums"]["billing_provider"]
          provider_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credentials?: Json | null
          deleted_on?: string | null
          id?: string
          namespace?: string
          provider?: Database["public"]["Enums"]["billing_provider"]
          provider_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          account_id: string
          customer_id: string
          email: string | null
          id: number
          provider: Database["public"]["Enums"]["billing_provider"]
        }
        Insert: {
          account_id: string
          customer_id: string
          email?: string | null
          id?: number
          provider: Database["public"]["Enums"]["billing_provider"]
        }
        Update: {
          account_id?: string
          customer_id?: string
          email?: string | null
          id?: number
          provider?: Database["public"]["Enums"]["billing_provider"]
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_services: {
        Row: {
          created_at: string
          deleted_on: string | null
          id: string
          provider: Database["public"]["Enums"]["billing_provider"]
          provider_id: string
          service_id: number
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["billing_provider"]
          provider_id: string
          service_id: number
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["billing_provider"]
          provider_id?: string
          service_id?: number
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_form_fields: {
        Row: {
          brief_id: string
          created_at: string
          form_field_id: string
          id: string
        }
        Insert: {
          brief_id: string
          created_at?: string
          form_field_id: string
          id?: string
        }
        Update: {
          brief_id?: string
          created_at?: string
          form_field_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_form_fields_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_form_fields_form_field_id_fkey"
            columns: ["form_field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_responses: {
        Row: {
          brief_id: string
          created_at: string
          form_field_id: string
          id: string
          order_id: string
          response: string
        }
        Insert: {
          brief_id: string
          created_at?: string
          form_field_id: string
          id?: string
          order_id: string
          response: string
        }
        Update: {
          brief_id?: string
          created_at?: string
          form_field_id?: string
          id?: string
          order_id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_responses_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_responses_form_field_id_fkey"
            columns: ["form_field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_responses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["uuid"]
          },
        ]
      }
      briefs: {
        Row: {
          created_at: string
          deleted_on: string | null
          description: string | null
          id: string
          image_url: string | null
          isDraft: boolean | null
          name: string
          number: number | null
          propietary_organization_id: string
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          isDraft?: boolean | null
          name: string
          number?: number | null
          propietary_organization_id: string
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          isDraft?: boolean | null
          name?: string
          number?: number | null
          propietary_organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefs_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefs_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          chat_id: string
          created_at: string
          deleted_on: string | null
          id: string
          settings: Json | null
          type: Database["public"]["Enums"]["chat_role_type"]
          updated_at: string
          user_id: string
          visibility: boolean
        }
        Insert: {
          chat_id: string
          created_at?: string
          deleted_on?: string | null
          id?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["chat_role_type"]
          updated_at?: string
          user_id: string
          visibility?: boolean
        }
        Update: {
          chat_id?: string
          created_at?: string
          deleted_on?: string | null
          id?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["chat_role_type"]
          updated_at?: string
          user_id?: string
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string | null
          id: string
          message_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          id?: string
          message_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          agency_id: string | null
          client_organization_id: string | null
          created_at: string | null
          deleted_on: string | null
          id: string
          image: string | null
          name: string
          reference_id: string | null
          settings: Json
          updated_at: string | null
          user_id: string
          visibility: boolean
        }
        Insert: {
          agency_id?: string | null
          client_organization_id?: string | null
          created_at?: string | null
          deleted_on?: string | null
          id?: string
          image?: string | null
          name: string
          reference_id?: string | null
          settings?: Json
          updated_at?: string | null
          user_id: string
          visibility?: boolean
        }
        Update: {
          agency_id?: string | null
          client_organization_id?: string | null
          created_at?: string | null
          deleted_on?: string | null
          id?: string
          image?: string | null
          name?: string
          reference_id?: string | null
          settings?: Json
          updated_at?: string | null
          user_id?: string
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chats_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "chats_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "chats_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_services: {
        Row: {
          checkout_id: string | null
          id: string
          service_id: number | null
        }
        Insert: {
          checkout_id?: string | null
          id?: string
          service_id?: number | null
        }
        Update: {
          checkout_id?: string | null
          id?: string
          service_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_services_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          created_at: string | null
          deleted_on: string | null
          id: string
          provider: string
          provider_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_on?: string | null
          id?: string
          provider: string
          provider_id: string
        }
        Update: {
          created_at?: string | null
          deleted_on?: string | null
          id?: string
          provider?: string
          provider_id?: string
        }
        Relationships: []
      }
      client_services: {
        Row: {
          agency_id: string
          client_id: string
          client_organization_id: string
          created_at: string
          created_by: string
          id: number
          service_id: number
        }
        Insert: {
          agency_id: string
          client_id: string
          client_organization_id: string
          created_at?: string
          created_by: string
          id?: number
          service_id: number
        }
        Update: {
          agency_id?: string
          client_id?: string
          client_organization_id?: string
          created_at?: string
          created_by?: string
          id?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_services_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_services_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_services_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agency_id: string
          deleted_on: string | null
          id: string
          organization_client_id: string
          user_client_id: string
        }
        Insert: {
          agency_id: string
          deleted_on?: string | null
          id?: string
          organization_client_id: string
          user_client_id: string
        }
        Update: {
          agency_id?: string
          deleted_on?: string | null
          id?: string
          organization_client_id?: string
          user_client_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "clients_agency_id_fkey1"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organization_client_id_fkey1"
            columns: ["organization_client_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organization_client_id_fkey1"
            columns: ["organization_client_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "clients_organization_client_id_fkey1"
            columns: ["organization_client_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_client_id_fkey"
            columns: ["user_client_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_client_id_fkey"
            columns: ["user_client_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing: boolean
          enable_team_account_billing: boolean
          enable_team_accounts: boolean
        }
        Insert: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing?: boolean
          enable_team_account_billing?: boolean
          enable_team_accounts?: boolean
        }
        Update: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing?: boolean
          enable_team_account_billing?: boolean
          enable_team_accounts?: boolean
        }
        Relationships: []
      }
      credits_usage: {
        Row: {
          id: number
          organization_id: string
          remaining_credits: number
        }
        Insert: {
          id?: number
          organization_id: string
          remaining_credits?: number
        }
        Update: {
          id?: number
          organization_id?: string
          remaining_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "credits_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "credits_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      embed_accounts: {
        Row: {
          account_id: string
          created_at: string
          embed_id: string
          id: number
        }
        Insert: {
          account_id: string
          created_at?: string
          embed_id: string
          id?: number
        }
        Update: {
          account_id?: string
          created_at?: string
          embed_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "embed_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embed_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embed_accounts_embed_id_fkey"
            columns: ["embed_id"]
            isOneToOne: false
            referencedRelation: "embeds"
            referencedColumns: ["id"]
          },
        ]
      }
      embeds: {
        Row: {
          created_at: string
          deleted_on: string | null
          icon: string | null
          id: string
          location: Database["public"]["Enums"]["embed_location"]
          organization_id: string | null
          title: string | null
          type: Database["public"]["Enums"]["embed_types"]
          updated_at: string | null
          user_id: string | null
          value: string
          visibility: Database["public"]["Enums"]["visibility"] | null
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          icon?: string | null
          id?: string
          location?: Database["public"]["Enums"]["embed_location"]
          organization_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["embed_types"]
          updated_at?: string | null
          user_id?: string | null
          value: string
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          icon?: string | null
          id?: string
          location?: Database["public"]["Enums"]["embed_location"]
          organization_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["embed_types"]
          updated_at?: string | null
          user_id?: string | null
          value?: string
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "embeds_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeds_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "embeds_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          name: string
          reference_id: string | null
          size: number
          temp_id: string | null
          type: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          name: string
          reference_id?: string | null
          size: number
          temp_id?: string | null
          type: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          name?: string
          reference_id?: string | null
          size?: number
          temp_id?: string | null
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_files: {
        Row: {
          agency_id: string | null
          client_organization_id: string | null
          created_at: string
          file_id: string
          folder_id: string
          id: string
        }
        Insert: {
          agency_id?: string | null
          client_organization_id?: string | null
          created_at?: string
          file_id: string
          folder_id: string
          id?: string
        }
        Update: {
          agency_id?: string | null
          client_organization_id?: string | null
          created_at?: string
          file_id?: string
          folder_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_files_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_files_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "folder_files_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_files_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_files_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "folder_files_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          agency_id: string
          client_organization_id: string
          created_at: string
          id: string
          is_subfolder: boolean | null
          name: string | null
          parent_folder_id: string | null
        }
        Insert: {
          agency_id: string
          client_organization_id: string
          created_at?: string
          id?: string
          is_subfolder?: boolean | null
          name?: string | null
          parent_folder_id?: string | null
        }
        Update: {
          agency_id?: string
          client_organization_id?: string
          created_at?: string
          id?: string
          is_subfolder?: boolean | null
          name?: string | null
          parent_folder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "folders_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "folders_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          alert_message: string | null
          created_at: string
          description: string | null
          id: string
          label: string
          options: Json[] | null
          placeholder: string | null
          position: number
          required: boolean | null
          type: Database["public"]["Enums"]["field_types"]
        }
        Insert: {
          alert_message?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label: string
          options?: Json[] | null
          placeholder?: string | null
          position: number
          required?: boolean | null
          type?: Database["public"]["Enums"]["field_types"]
        }
        Update: {
          alert_message?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          options?: Json[] | null
          placeholder?: string | null
          position?: number
          required?: boolean | null
          type?: Database["public"]["Enums"]["field_types"]
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: number
          invite_token: string
          invited_by: string
          organization_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: number
          invite_token: string
          invited_by: string
          organization_id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: number
          invite_token?: string
          invited_by?: string
          organization_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      message_reads: {
        Row: {
          chat_id: string | null
          id: string
          message_id: string
          order_id: number | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          chat_id?: string | null
          id?: string
          message_id: string
          order_id?: number | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string | null
          id?: string
          message_id?: string
          order_id?: number | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string | null
          created_at: string
          deleted_on: string | null
          id: string
          order_id: number | null
          parent_id: string | null
          temp_id: string | null
          type: Database["public"]["Enums"]["message_category"]
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["messages_types"] | null
        }
        Insert: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          order_id?: number | null
          parent_id?: string | null
          temp_id?: string | null
          type?: Database["public"]["Enums"]["message_category"]
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["messages_types"] | null
        }
        Update: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          order_id?: number | null
          parent_id?: string | null
          temp_id?: string | null
          type?: Database["public"]["Enums"]["message_category"]
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["messages_types"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          account_id: string
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          dismissed: boolean
          expires_at: string | null
          id: number
          link: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          account_id: string
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed?: boolean
          expires_at?: string | null
          id?: never
          link?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          account_id?: string
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed?: boolean
          expires_at?: string | null
          id?: never
          link?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      order_assignations: {
        Row: {
          agency_member_id: string
          order_id: number
        }
        Insert: {
          agency_member_id: string
          order_id: number
        }
        Update: {
          agency_member_id?: string
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_assignations_agency_member_id_fkey"
            columns: ["agency_member_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignations_agency_member_id_fkey"
            columns: ["agency_member_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      order_files: {
        Row: {
          created_at: string
          file_id: string
          order_id: string
        }
        Insert: {
          created_at?: string
          file_id?: string
          order_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["uuid"]
          },
        ]
      }
      order_followers: {
        Row: {
          client_member_id: string
          created_at: string | null
          order_id: number
        }
        Insert: {
          client_member_id?: string
          created_at?: string | null
          order_id: number
        }
        Update: {
          client_member_id?: string
          created_at?: string | null
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_followers_client_member_id_fkey"
            columns: ["client_member_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_followers_client_member_id_fkey"
            columns: ["client_member_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_followers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_amount: number | null
          product_id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id: string
          order_id: string
          price_amount?: number | null
          product_id: string
          quantity?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_amount?: number | null
          product_id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tags: {
        Row: {
          created_at: string
          order_id: number
          tag_id: string | null
        }
        Insert: {
          created_at?: string
          order_id: number
          tag_id?: string | null
        }
        Update: {
          created_at?: string
          order_id?: number
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at?: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          billing_customer_id?: number
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_v2: {
        Row: {
          agency_id: string
          brief_id: string | null
          brief_ids: string[] | null
          client_organization_id: string
          created_at: string
          customer_id: string
          deleted_on: string | null
          description: string
          due_date: string | null
          id: number
          position: number | null
          priority: Database["public"]["Enums"]["priority_types"] | null
          propietary_organization_id: string
          status: string | null
          status_id: number | null
          stripe_account_id: string | null
          title: string
          updated_at: string | null
          uuid: string
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          agency_id: string
          brief_id?: string | null
          brief_ids?: string[] | null
          client_organization_id: string
          created_at?: string
          customer_id: string
          deleted_on?: string | null
          description: string
          due_date?: string | null
          id?: number
          position?: number | null
          priority?: Database["public"]["Enums"]["priority_types"] | null
          propietary_organization_id: string
          status?: string | null
          status_id?: number | null
          stripe_account_id?: string | null
          title: string
          updated_at?: string | null
          uuid: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          agency_id?: string
          brief_id?: string | null
          brief_ids?: string[] | null
          client_organization_id?: string
          created_at?: string
          customer_id?: string
          deleted_on?: string | null
          description?: string
          due_date?: string | null
          id?: number
          position?: number | null
          priority?: Database["public"]["Enums"]["priority_types"] | null
          propietary_organization_id?: string
          status?: string | null
          status_id?: number | null
          stripe_account_id?: string | null
          title?: string
          updated_at?: string | null
          uuid?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_v2_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "orders_v2_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "orders_v2_client_organization_id_fkey1"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_v2_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "agency_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string
          id: string
          key: Database["public"]["Enums"]["organization_setting_key"]
          organization_id: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: Database["public"]["Enums"]["organization_setting_key"]
          organization_id: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: Database["public"]["Enums"]["organization_setting_key"]
          organization_id?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subdomains: {
        Row: {
          id: string
          organization_id: string
          subdomain_id: string
        }
        Insert: {
          id?: string
          organization_id: string
          subdomain_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          subdomain_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subdomains_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subdomains_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_subdomains_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subdomains_subdomain_id_fkey"
            columns: ["subdomain_id"]
            isOneToOne: false
            referencedRelation: "subdomains"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          deleted_on: string | null
          id: string
          name: string | null
          owner_id: string | null
          picture_url: string | null
          public_data: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          id?: string
          name?: string | null
          owner_id?: string | null
          picture_url?: string | null
          public_data?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          id?: string
          name?: string | null
          owner_id?: string | null
          picture_url?: string | null
          public_data?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          name: string
          tokens_quota: number
          variant_id: string
        }
        Insert: {
          name: string
          tokens_quota: number
          variant_id: string
        }
        Update: {
          name?: string
          tokens_quota?: number
          variant_id?: string
        }
        Relationships: []
      }
      plugins: {
        Row: {
          created_at: string
          deleted_on: string | null
          description: string | null
          icon_url: string | null
          id: string
          metadata: Json | null
          name: string
          type: Database["public"]["Enums"]["plugin_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
          name: string
          type?: Database["public"]["Enums"]["plugin_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: Database["public"]["Enums"]["plugin_type"]
          updated_at?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: number
          type: Database["public"]["Enums"]["reaction_types"]
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: number
          type: Database["public"]["Enums"]["reaction_types"]
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: number
          type?: Database["public"]["Enums"]["reaction_types"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          order_id: number
          rating: number | null
          temp_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order_id: number
          rating?: number | null
          temp_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order_id?: number
          rating?: number | null
          temp_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permissions"]
          role: string
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permissions"]
          role: string
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permissions"]
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          hierarchy_level: number
          name: string
        }
        Insert: {
          hierarchy_level: number
          name: string
        }
        Update: {
          hierarchy_level?: number
          name?: string
        }
        Relationships: []
      }
      service_briefs: {
        Row: {
          brief_id: string
          created_at: string
          service_id: number
        }
        Insert: {
          brief_id?: string
          created_at?: string
          service_id?: number
        }
        Update: {
          brief_id?: string
          created_at?: string
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_briefs_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_briefs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          allowed_orders: number | null
          checkout_url: string | null
          created_at: string
          credit_based: boolean | null
          credits: number | null
          currency: string
          deleted_on: string | null
          hours: number | null
          id: number
          max_number_of_monthly_orders: number | null
          max_number_of_simultaneous_orders: number | null
          name: string
          number_of_clients: number | null
          price: number | null
          price_id: string | null
          propietary_organization_id: string | null
          purchase_limit: number
          recurrence: string | null
          recurring_subscription: boolean | null
          service_description: string | null
          service_image: string | null
          single_sale: boolean | null
          standard: boolean
          status: Database["public"]["Enums"]["service_status"]
          test_period: boolean | null
          test_period_duration: number | null
          test_period_duration_unit_of_measurement: string | null
          test_period_price: number | null
          time_based: boolean | null
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          allowed_orders?: number | null
          checkout_url?: string | null
          created_at?: string
          credit_based?: boolean | null
          credits?: number | null
          currency?: string
          deleted_on?: string | null
          hours?: number | null
          id?: number
          max_number_of_monthly_orders?: number | null
          max_number_of_simultaneous_orders?: number | null
          name: string
          number_of_clients?: number | null
          price?: number | null
          price_id?: string | null
          propietary_organization_id?: string | null
          purchase_limit?: number
          recurrence?: string | null
          recurring_subscription?: boolean | null
          service_description?: string | null
          service_image?: string | null
          single_sale?: boolean | null
          standard: boolean
          status?: Database["public"]["Enums"]["service_status"]
          test_period?: boolean | null
          test_period_duration?: number | null
          test_period_duration_unit_of_measurement?: string | null
          test_period_price?: number | null
          time_based?: boolean | null
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          allowed_orders?: number | null
          checkout_url?: string | null
          created_at?: string
          credit_based?: boolean | null
          credits?: number | null
          currency?: string
          deleted_on?: string | null
          hours?: number | null
          id?: number
          max_number_of_monthly_orders?: number | null
          max_number_of_simultaneous_orders?: number | null
          name?: string
          number_of_clients?: number | null
          price?: number | null
          price_id?: string | null
          propietary_organization_id?: string | null
          purchase_limit?: number
          recurrence?: string | null
          recurring_subscription?: boolean | null
          service_description?: string | null
          service_image?: string | null
          single_sale?: boolean | null
          standard?: boolean
          status?: Database["public"]["Enums"]["service_status"]
          test_period?: boolean | null
          test_period_duration?: number | null
          test_period_duration_unit_of_measurement?: string | null
          test_period_price?: number | null
          time_based?: boolean | null
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "services_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_country: string | null
          client_email: string | null
          client_name: string | null
          client_postal_code: string | null
          client_state: string | null
          created_at: string
          deleted_on: string | null
          id: string
          provider: string | null
          provider_id: string | null
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name?: string | null
          client_postal_code?: string | null
          client_state?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          provider?: string | null
          provider_id?: string | null
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name?: string | null
          client_postal_code?: string | null
          client_state?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          provider?: string | null
          provider_id?: string | null
        }
        Relationships: []
      }
      subdomains: {
        Row: {
          created_at: string
          deleted_on: string | null
          domain: string
          id: string
          namespace: string
          provider: string
          provider_id: string
          service_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_on?: string | null
          domain: string
          id?: string
          namespace: string
          provider?: string
          provider_id?: string
          service_name?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_on?: string | null
          domain?: string
          id?: string
          namespace?: string
          provider?: string
          provider_id?: string
          service_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string
          id: string
          interval: string
          interval_count: number
          price_amount: number | null
          product_id: string
          quantity: number
          subscription_id: string
          type: Database["public"]["Enums"]["subscription_item_type"]
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id: string
          interval: string
          interval_count: number
          price_amount?: number | null
          product_id: string
          quantity?: number
          subscription_id: string
          type: Database["public"]["Enums"]["subscription_item_type"]
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interval?: string
          interval_count?: number
          price_amount?: number | null
          product_id?: string
          quantity?: number
          subscription_id?: string
          type?: Database["public"]["Enums"]["subscription_item_type"]
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string | null
          active: boolean
          billing_customer_id: string
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at: string | null
          currency: string
          days_used: number
          id: string
          period_ends_at: string | null
          period_starts_at: string | null
          propietary_organization_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          token_id: string
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          active: boolean
          billing_customer_id: string
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at?: string | null
          currency: string
          days_used?: number
          id: string
          period_ends_at?: string | null
          period_starts_at?: string | null
          propietary_organization_id?: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          token_id?: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          active?: boolean
          billing_customer_id?: string
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end?: boolean
          created_at?: string | null
          currency?: string
          days_used?: number
          id?: string
          period_ends_at?: string | null
          period_starts_at?: string | null
          propietary_organization_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          token_id?: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_propietary_organization_id_fkey"
            columns: ["propietary_organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      subtask_assignations: {
        Row: {
          agency_member_id: string
          subtask_id: string | null
        }
        Insert: {
          agency_member_id: string
          subtask_id?: string | null
        }
        Update: {
          agency_member_id?: string
          subtask_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtask_assignations_agency_member_id_fkey"
            columns: ["agency_member_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtask_assignations_agency_member_id_fkey"
            columns: ["agency_member_id"]
            isOneToOne: true
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtask_assignations_subtask_id_fkey"
            columns: ["subtask_id"]
            isOneToOne: false
            referencedRelation: "subtasks"
            referencedColumns: ["id"]
          },
        ]
      }
      subtask_followers: {
        Row: {
          client_member_id: string | null
          created_at: string
          subtask_id: string | null
        }
        Insert: {
          client_member_id?: string | null
          created_at?: string
          subtask_id?: string | null
        }
        Update: {
          client_member_id?: string | null
          created_at?: string
          subtask_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtask_followers_client_member_id_fkey"
            columns: ["client_member_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtask_followers_client_member_id_fkey"
            columns: ["client_member_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtask_followers_subtask_id_fkey"
            columns: ["subtask_id"]
            isOneToOne: false
            referencedRelation: "subtasks"
            referencedColumns: ["id"]
          },
        ]
      }
      subtask_timers: {
        Row: {
          subtask_id: string
          timer_id: string
        }
        Insert: {
          subtask_id: string
          timer_id: string
        }
        Update: {
          subtask_id?: string
          timer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtask_timers_subtask_id_fkey"
            columns: ["subtask_id"]
            isOneToOne: false
            referencedRelation: "subtasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtask_timers_timer_id_fkey"
            columns: ["timer_id"]
            isOneToOne: false
            referencedRelation: "timers"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          completed: boolean | null
          content: string | null
          created_at: string
          deleted_on: string | null
          end_date: string | null
          id: string
          name: string | null
          parent_task_id: string | null
          position: number | null
          priority: Database["public"]["Enums"]["priority_types"] | null
          start_date: string | null
          state: string | null
          state_id: number | null
        }
        Insert: {
          completed?: boolean | null
          content?: string | null
          created_at?: string
          deleted_on?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["priority_types"] | null
          start_date?: string | null
          state?: string | null
          state_id?: number | null
        }
        Update: {
          completed?: boolean | null
          content?: string | null
          created_at?: string
          deleted_on?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["priority_types"] | null
          start_date?: string | null
          state?: string | null
          state_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "agency_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          deleted_on: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tags_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "user_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          deleted_on: string | null
          id: string
          name: string | null
          order_id: number | null
          position: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          name?: string | null
          order_id?: number | null
          position?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          deleted_on?: string | null
          id?: string
          name?: string | null
          order_id?: number | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      timers: {
        Row: {
          created_at: string | null
          deleted_on: string | null
          elapsed_time: number | null
          end_time: number | null
          id: string
          name: string | null
          start_time: number | null
          status: string | null
          timestamp: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_on?: string | null
          elapsed_time?: number | null
          end_time?: number | null
          id?: string
          name?: string | null
          start_time?: number | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_on?: string | null
          elapsed_time?: number | null
          end_time?: number | null
          id?: string
          name?: string | null
          start_time?: number | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          id_token_provider: string
          provider: string
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          id_token_provider?: string
          provider?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          id_token_provider?: string
          provider?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          calendar: string | null
          created_at: string
          name: string | null
          phone_number: string | null
          picture_url: string | null
          preferences: Json | null
          user_id: string
        }
        Insert: {
          calendar?: string | null
          created_at?: string
          name?: string | null
          phone_number?: string | null
          picture_url?: string | null
          preferences?: Json | null
          user_id: string
        }
        Update: {
          calendar?: string | null
          created_at?: string
          name?: string | null
          phone_number?: string | null
          picture_url?: string | null
          preferences?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_account_workspace: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          picture_url: string | null
          role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_memberships_account_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      user_organization: {
        Row: {
          id: string | null
          name: string | null
          owner_id: string | null
          picture_url: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: {
          token: string
          user_id: string
        }
        Returns: string
      }
      add_invitations_to_account: {
        Args: {
          account_slug: string
          invitations: Database["public"]["CompositeTypes"]["invitation"][]
        }
        Returns: Database["public"]["Tables"]["invitations"]["Row"][]
      }
      can_action_account_member: {
        Args: {
          target_organization_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      create_invitation: {
        Args: {
          account_id: string
          email: string
          role: string
        }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: number
          invite_token: string
          invited_by: string
          organization_id: string
          role: string
          updated_at: string
        }
      }
      create_order:
        | {
            Args: {
              _order: Json
              _brief_responses: Json[]
              _order_followers: string[]
              _order_file_ids: string[]
            }
            Returns: {
              agency_id: string
              brief_id: string | null
              brief_ids: string[] | null
              client_organization_id: string
              created_at: string
              customer_id: string
              deleted_on: string | null
              description: string
              due_date: string | null
              id: number
              position: number | null
              priority: Database["public"]["Enums"]["priority_types"] | null
              propietary_organization_id: string
              status: string | null
              status_id: number | null
              stripe_account_id: string | null
              title: string
              updated_at: string | null
              uuid: string
              visibility: Database["public"]["Enums"]["visibility"]
            }
          }
        | {
            Args: {
              _order: Json
              _brief_responses: Json[]
              _order_followers: string[]
              _order_file_ids: string[]
              _domain: string
            }
            Returns: {
              agency_id: string
              brief_id: string | null
              brief_ids: string[] | null
              client_organization_id: string
              created_at: string
              customer_id: string
              deleted_on: string | null
              description: string
              due_date: string | null
              id: number
              position: number | null
              priority: Database["public"]["Enums"]["priority_types"] | null
              propietary_organization_id: string
              status: string | null
              status_id: number | null
              stripe_account_id: string | null
              title: string
              updated_at: string | null
              uuid: string
              visibility: Database["public"]["Enums"]["visibility"]
            }
          }
      create_team_account: {
        Args: {
          account_name: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          deleted_on: string | null
          email: string | null
          id: string
          loom_app_id: string | null
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
      }
      deduct_credits: {
        Args: {
          account_id: string
          amount: number
        }
        Returns: undefined
      }
      get_account_invitations: {
        Args: {
          account_slug: string
        }
        Returns: {
          id: number
          email: string
          account_id: string
          invited_by: string
          role: string
          created_at: string
          updated_at: string
          expires_at: string
          inviter_name: string
          inviter_email: string
        }[]
      }
      get_account_members: {
        Args: {
          organization_slug: string
        }
        Returns: {
          id: string
          user_id: string
          organization_id: string
          role: string
          role_hierarchy_level: number
          owner_user_id: string
          name: string
          email: string
          picture_url: string
          created_at: string
          updated_at: string
          settings: Json
        }[]
      }
      get_agency_id_from_orders_v2: {
        Args: {
          target_user_id: string
          order_id: number
        }
        Returns: string
      }
      get_client_organization_id_from_orders_v2: {
        Args: {
          target_user_id: string
          order_id: number
        }
        Returns: string
      }
      get_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_session: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["session_info"]
      }
      get_unread_message_counts: {
        Args: {
          p_user_id: string
        }
        Returns: {
          chat_id: string
          chat_unread_count: number
          order_id: number
          order_unread_count: number
        }[]
      }
      get_upper_system_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_account_name_changes: {
        Args: {
          p_account_id: string
          p_name: string
          p_is_personal_accounts: boolean
          p_old_name: string
        }
        Returns: number
      }
      has_active_subscription: {
        Args: {
          target_account_id: string
        }
        Returns: boolean
      }
      has_credits: {
        Args: {
          account_id: string
        }
        Returns: boolean
      }
      has_more_elevated_role: {
        Args: {
          target_user_id: string
          target_account_id: string
          role_name: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          user_id: string
          organization_id: string
          permission_name: Database["public"]["Enums"]["app_permissions"]
        }
        Returns: boolean
      }
      has_permission_in_organizations: {
        Args: {
          target_user_id: string
          permission_name: Database["public"]["Enums"]["app_permissions"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _org_id: string
          _role_name: string
        }
        Returns: boolean
      }
      has_role_on_account: {
        Args: {
          organization_id: string
          account_role?: string
        }
        Returns: boolean
      }
      has_same_role_hierarchy_level: {
        Args: {
          target_user_id: string
          target_account_id: string
          role_name: string
        }
        Returns: boolean
      }
      has_same_role_hierarchy_level_or_lower: {
        Args: {
          target_user_id: string
          target_account_id: string
          role_name: string
        }
        Returns: boolean
      }
      insert_service_brief_relation:
        | {
            Args: {
              service_id: number
              brief_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              service_id: string
              brief_id: string
            }
            Returns: undefined
          }
      is_account_owner: {
        Args: {
          organization_id: string
        }
        Returns: boolean
      }
      is_account_team_member: {
        Args: {
          target_account_id: string
        }
        Returns: boolean
      }
      is_agency_client: {
        Args: {
          _agency_id: string
        }
        Returns: boolean
      }
      is_set: {
        Args: {
          field_name: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: {
          organization_id: string
          user_id: string
        }
        Returns: boolean
      }
      is_user_in_agency_organization: {
        Args: {
          user_id: string
          target_organization_id: string
        }
        Returns: boolean
      }
      is_user_in_client_organization: {
        Args: {
          user_id: string
          target_organization_id: string
        }
        Returns: boolean
      }
      mark_messages_as_read: {
        Args: {
          p_user_id: string
          p_chat_id: string
        }
        Returns: number
      }
      mark_order_messages_as_read: {
        Args: {
          p_user_id: string
          p_order_id: number
        }
        Returns: number
      }
      set_session: {
        Args: {
          domain: string
        }
        Returns: undefined
      }
      team_account_workspace: {
        Args: {
          account_slug: string
        }
        Returns: {
          id: string
          name: string
          picture_url: string
          slug: string
          role: string
          role_hierarchy_level: number
          primary_owner_user_id: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          permissions: Database["public"]["Enums"]["app_permissions"][]
        }[]
      }
      transfer_team_account_ownership: {
        Args: {
          target_account_id: string
          new_owner_id: string
        }
        Returns: undefined
      }
      update_order_with_position: {
        Args: {
          p_order_id: number
          p_order_updates: Json
          p_position_updates: Json[]
        }
        Returns: {
          agency_id: string
          brief_id: string | null
          brief_ids: string[] | null
          client_organization_id: string
          created_at: string
          customer_id: string
          deleted_on: string | null
          description: string
          due_date: string | null
          id: number
          position: number | null
          priority: Database["public"]["Enums"]["priority_types"] | null
          propietary_organization_id: string
          status: string | null
          status_id: number | null
          stripe_account_id: string | null
          title: string
          updated_at: string | null
          uuid: string
          visibility: Database["public"]["Enums"]["visibility"]
        }
      }
      upsert_order: {
        Args: {
          target_account_id: string
          target_customer_id: string
          target_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          total_amount: number
          currency: string
          line_items: Json
        }
        Returns: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
        }
      }
      upsert_subscription: {
        Args: {
          target_account_id: string
          target_customer_id: string
          target_subscription_id: string
          active: boolean
          status: Database["public"]["Enums"]["subscription_status"]
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          currency: string
          period_starts_at: string
          period_ends_at: string
          line_items: Json
          trial_starts_at?: string
          trial_ends_at?: string
        }
        Returns: {
          account_id: string | null
          active: boolean
          billing_customer_id: string
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at: string | null
          currency: string
          days_used: number
          id: string
          period_ends_at: string | null
          period_starts_at: string | null
          propietary_organization_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          token_id: string
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string | null
        }
      }
      user_belongs_to_agency_organizations: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_client_organizations: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_type: "create" | "update" | "delete" | "complete"
      activity_type:
        | "message"
        | "review"
        | "status"
        | "priority"
        | "assign"
        | "due_date"
        | "description"
        | "title"
        | "assigned_to"
        | "task"
        | "annotation"
      annotations_status: "active" | "completed" | "draft"
      app_permissions:
        | "roles.manage"
        | "billing.manage"
        | "settings.manage"
        | "members.manage"
        | "invites.manage"
        | "tasks.write"
        | "tasks.delete"
        | "messages.write"
        | "messages.read"
        | "orders.write"
        | "orders.read"
        | "orders.manage"
        | "orders.delete"
        | "services.write"
        | "services.read"
        | "services.manage"
        | "services.delete"
        | "billing.write"
        | "billing.read"
        | "billing.delete"
        | "timers.write"
        | "timers.read"
        | "timers.manage"
        | "timers.delete"
        | "embeds.write"
        | "embeds.read"
        | "embeds.manage"
        | "embeds.delete"
      billing_provider:
        | "stripe"
        | "lemon-squeezy"
        | "paddle"
        | "treli"
        | "suuper"
      chat_role: "user" | "assistant"
      chat_role_type: "project_manager" | "assistant" | "owner" | "guest"
      embed_location: "tab" | "sidebar"
      embed_types: "url" | "iframe"
      field_types:
        | "date"
        | "multiple_choice"
        | "select"
        | "text"
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "text-short"
        | "text-large"
        | "number"
        | "file"
        | "dropdown"
        | "rich-text"
        | "image"
        | "video"
      file_types: "image" | "video" | "pdf" | "fig"
      message_category: "chat_message" | "annotation"
      messages_types: "public" | "internal_agency"
      notification_channel: "in_app" | "email"
      notification_type: "info" | "warning" | "error"
      order_status_types:
        | "in_progress"
        | "in_review"
        | "pending"
        | "completed"
        | "annulled"
      organization_setting_key:
        | "theme_color"
        | "background_color"
        | "logo_url"
        | "timezone"
        | "language"
        | "date_format"
        | "sidebar_background_color"
        | "portal_name"
        | "favicon_url"
        | "sender_name"
        | "sender_email"
        | "sender_domain"
        | "logo_dark_url"
        | "auth_card_background_color"
        | "auth_section_background_color"
        | "dashboard_url"
        | "pinned_organizations"
        | "catalog_provider_url"
        | "catalog_product_url"
        | "tool_copy_list_url"
      payment_status: "pending" | "succeeded" | "failed"
      plugin_status: "installed" | "uninstalled" | "failed" | "in progress"
      plugin_type: "tool" | "internal" | "external" | "integration"
      priority_types: "high" | "medium" | "low"
      reaction_types: "like" | "favorite"
      service_status:
        | "active"
        | "inactive"
        | "draft"
        | "expired"
        | "paused"
        | "blocked"
        | "scheduled"
        | "pending"
        | "deleted"
      subscription_item_type: "flat" | "per_seat" | "metered"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      visibility: "public" | "private"
    }
    CompositeTypes: {
      invitation: {
        email: string | null
        role: string | null
      }
      organization_info: {
        session_id: string | null
        id: string | null
        owner_id: string | null
        slug: string | null
        name: string | null
        role: string | null
        domain: string | null
      }
      session_info: {
        session_id: string | null
        agency: Database["public"]["CompositeTypes"]["organization_info"] | null
        organization:
          | Database["public"]["CompositeTypes"]["organization_info"]
          | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

