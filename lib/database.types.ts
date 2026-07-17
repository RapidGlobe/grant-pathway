export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
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
      ai_usage_log: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          request_type: Database['public']['Enums']['ai_request_type']
          token_count: number | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          request_type: Database['public']['Enums']['ai_request_type']
          token_count?: number | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          request_type?: Database['public']['Enums']['ai_request_type']
          token_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_usage_log_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
      application_guidelines: {
        Row: {
          application_id: string
          created_at: string
          guideline_text: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          guideline_text: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          guideline_text?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'application_guidelines_application_id_fkey'
            columns: ['application_id']
            isOneToOne: true
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
      application_items: {
        Row: {
          added_manually: boolean
          ai_refined_answer: string | null
          answer_source: Database['public']['Enums']['answer_source'] | null
          answer_text: string | null
          application_id: string
          char_limit: number | null
          cloned_from_application_id: string | null
          created_at: string
          decision_maker_visible: boolean
          field_key: string | null
          guideline_reference: Json | null
          id: string
          is_approved: boolean
          is_budget_question: boolean
          item_label: string
          item_order: number
          item_type: Database['public']['Enums']['application_item_type']
          limit_type: string | null
          output_mode: Database['public']['Enums']['item_output_mode']
          rubric_criterion_link: string | null
          source_of_truth: Database['public']['Enums']['item_source_of_truth']
          updated_at: string
          user_id: string
          validation_mode: Database['public']['Enums']['item_validation_mode'] | null
          visibility_condition: Json | null
          word_limit: number | null
        }
        Insert: {
          added_manually?: boolean
          ai_refined_answer?: string | null
          answer_source?: Database['public']['Enums']['answer_source'] | null
          answer_text?: string | null
          application_id: string
          char_limit?: number | null
          cloned_from_application_id?: string | null
          created_at?: string
          decision_maker_visible?: boolean
          field_key?: string | null
          guideline_reference?: Json | null
          id?: string
          is_approved?: boolean
          is_budget_question?: boolean
          item_label: string
          item_order: number
          item_type: Database['public']['Enums']['application_item_type']
          limit_type?: string | null
          output_mode?: Database['public']['Enums']['item_output_mode']
          rubric_criterion_link?: string | null
          source_of_truth: Database['public']['Enums']['item_source_of_truth']
          updated_at?: string
          user_id: string
          validation_mode?: Database['public']['Enums']['item_validation_mode'] | null
          visibility_condition?: Json | null
          word_limit?: number | null
        }
        Update: {
          added_manually?: boolean
          ai_refined_answer?: string | null
          answer_source?: Database['public']['Enums']['answer_source'] | null
          answer_text?: string | null
          application_id?: string
          char_limit?: number | null
          cloned_from_application_id?: string | null
          created_at?: string
          decision_maker_visible?: boolean
          field_key?: string | null
          guideline_reference?: Json | null
          id?: string
          is_approved?: boolean
          is_budget_question?: boolean
          item_label?: string
          item_order?: number
          item_type?: Database['public']['Enums']['application_item_type']
          limit_type?: string | null
          output_mode?: Database['public']['Enums']['item_output_mode']
          rubric_criterion_link?: string | null
          source_of_truth?: Database['public']['Enums']['item_source_of_truth']
          updated_at?: string
          user_id?: string
          validation_mode?: Database['public']['Enums']['item_validation_mode'] | null
          visibility_condition?: Json | null
          word_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'application_items_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'application_items_cloned_from_application_id_fkey'
            columns: ['cloned_from_application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
        ]
      }
      applications: {
        Row: {
          ai_summary: string | null
          assembled_draft: string | null
          created_at: string
          current_step: number
          draft_status: string
          first_exported_at: string | null
          funder_id: string | null
          funder_name: string
          grant_name: string
          id: string
          last_exported_at: string | null
          status: Database['public']['Enums']['application_status']
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          assembled_draft?: string | null
          created_at?: string
          current_step?: number
          draft_status?: string
          first_exported_at?: string | null
          funder_id?: string | null
          funder_name: string
          grant_name: string
          id?: string
          last_exported_at?: string | null
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          assembled_draft?: string | null
          created_at?: string
          current_step?: number
          draft_status?: string
          first_exported_at?: string | null
          funder_id?: string | null
          funder_name?: string
          grant_name?: string
          id?: string
          last_exported_at?: string | null
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_funder_id_fkey'
            columns: ['funder_id']
            isOneToOne: false
            referencedRelation: 'funders'
            referencedColumns: ['id']
          },
        ]
      }
      charity_profiles: {
        Row: {
          charity_name: string
          created_at: string
          id: string
          lookup_source: string | null
          registration_number: string | null
          updated_at: string
          user_id: string
          what_charity_does: string
          where_charity_works: string
          who_charity_helps: string
        }
        Insert: {
          charity_name: string
          created_at?: string
          id?: string
          lookup_source?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id: string
          what_charity_does: string
          where_charity_works: string
          who_charity_helps: string
        }
        Update: {
          charity_name?: string
          created_at?: string
          id?: string
          lookup_source?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string
          what_charity_does?: string
          where_charity_works?: string
          who_charity_helps?: string
        }
        Relationships: []
      }
      funders: {
        Row: {
          created_at: string
          grant_range: string | null
          guidelines_url: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          grant_range?: string | null
          guidelines_url?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          grant_range?: string | null
          guidelines_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          feedback_consent: boolean
          first_name: string
          id: string
          last_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_consent?: boolean
          first_name: string
          id?: string
          last_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_consent?: boolean
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_application: {
        Args: { p_application_id: string; p_user_id: string }
        Returns: undefined
      }
      cancel_ai_slot: {
        Args: { p_log_id: string; p_user_id: string }
        Returns: undefined
      }
      reopen_application: {
        Args: { p_application_id: string; p_user_id: string }
        Returns: undefined
      }
      reserve_ai_slot: {
        Args: {
          p_application_id: string | null
          p_approaching_threshold: number
          p_monthly_cap: number
          p_request_type: Database['public']['Enums']['ai_request_type']
          p_user_id: string
        }
        Returns: {
          allowed: boolean
          log_id: string | null
          approaching_limit: boolean
          current_usage: number
        }
      }
      update_ai_slot_token_count: {
        Args: { p_log_id: string; p_token_count: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      ai_request_type:
        | 'guideline_summary'
        | 'draft_generation'
        | 'refine_answer'
        | 'assemble_draft'
        | 'charity_paraphrase'
      answer_source: 'ai_generated' | 'user_edited' | 'user_written'
      application_item_type:
        | 'narrative'
        | 'data'
        | 'date'
        | 'number'
        | 'table'
        | 'file'
        | 'consent'
        | 'eligibility_gate'
        | 'scoring_criterion'
        | 'manual_action'
      application_status: 'not_started' | 'in_progress' | 'approved' | 'exported' | 'mismatch'
      item_output_mode: 'generic_export' | 'native_template_fill'
      item_source_of_truth: 'user_input' | 'charity_profile' | 'derived' | 'disclosure'
      item_validation_mode: 'hard_check' | 'judgement_flag'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_request_type: [
        'guideline_summary',
        'draft_generation',
        'refine_answer',
        'assemble_draft',
        'charity_paraphrase',
      ],
      answer_source: ['ai_generated', 'user_edited', 'user_written'],
      application_item_type: [
        'narrative',
        'data',
        'date',
        'number',
        'table',
        'file',
        'consent',
        'eligibility_gate',
        'scoring_criterion',
        'manual_action',
      ],
      application_status: ['not_started', 'in_progress', 'approved', 'exported', 'mismatch'],
      item_output_mode: ['generic_export', 'native_template_fill'],
      item_source_of_truth: ['user_input', 'charity_profile', 'derived', 'disclosure'],
      item_validation_mode: ['hard_check', 'judgement_flag'],
    },
  },
} as const
