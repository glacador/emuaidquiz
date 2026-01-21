export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      funnels: {
        Row: {
          id: string
          name: string
          tagline: string
          domain: string
          brand_color: string
          brand_color_light: string
          brand_color_bg: string
          hook_headline: string
          hook_subheadline: string
          hook_stat: string
          question_count: string
          time_estimate: string
          cta_text: string
          social_proof_count: number
          tracking_config: Json
          buybox_config: Json
          trust_badges: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['funnels']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['funnels']['Insert']>
      }
      conditions: {
        Row: {
          id: string
          funnel_id: string
          code: string
          name: string
          slug: string
          short_name: string
          results_label: string
          results_headline: string
          results_intro: string
          results_body: string
          base_weight: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conditions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conditions']['Insert']>
      }
      questions: {
        Row: {
          id: string
          funnel_id: string
          question_id: string
          type: 'single' | 'multi' | 'image-grid' | 'belief-card' | 'social-proof'
          title: string | null
          subtitle: string | null
          help_text: string | null
          // For belief cards
          icon: string | null
          stat: string | null
          headline: string | null
          subtext: string | null
          duration: number | null
          // For social proof
          testimonial_name: string | null
          testimonial_location: string | null
          testimonial_pattern: string | null
          testimonial_quote: string | null
          testimonial_time_ago: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          label: string
          sublabel: string | null
          value: string
          emoji: string | null
          image_url: string | null
          scores: Json | null
          urgency_add: number | null
          percentage: number | null
          code: string | null
          priority: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['question_options']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['question_options']['Insert']>
      }
      objection_content: {
        Row: {
          id: string
          funnel_id: string
          key: string
          headline: string
          body: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['objection_content']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['objection_content']['Insert']>
      }
      ab_tests: {
        Row: {
          id: string
          funnel_id: string
          name: string
          description: string | null
          status: 'draft' | 'active' | 'paused' | 'completed'
          test_type: 'theme' | 'copy' | 'layout' | 'offer'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ab_tests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ab_tests']['Insert']>
      }
      ab_test_variants: {
        Row: {
          id: string
          test_id: string
          name: string
          weight: number
          config: Json
          is_control: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ab_test_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ab_test_variants']['Insert']>
      }
      ab_test_results: {
        Row: {
          id: string
          test_id: string
          variant_id: string
          session_id: string
          condition_code: string | null
          converted: boolean
          conversion_value: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ab_test_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ab_test_results']['Insert']>
      }
      quiz_sessions: {
        Row: {
          id: string
          funnel_id: string
          session_id: string
          email: string | null
          first_name: string | null
          condition_code: string | null
          urgency_score: number | null
          urgency_band: string | null
          answers: Json | null
          ab_variant_id: string | null
          converted: boolean
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['quiz_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quiz_sessions']['Insert']>
      }
    }
  }
}

// Helper types
export type Funnel = Database['public']['Tables']['funnels']['Row']
export type Condition = Database['public']['Tables']['conditions']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionOption = Database['public']['Tables']['question_options']['Row']
export type ABTest = Database['public']['Tables']['ab_tests']['Row']
export type ABTestVariant = Database['public']['Tables']['ab_test_variants']['Row']
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row']
