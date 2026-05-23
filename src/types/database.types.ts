/**
 * Supabase database type definitions.
 * Run `npx supabase gen types typescript` to regenerate after schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      /* ── profiles ─────────────────────────────────────────── */
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_id: string;
          auth_provider: 'email' | 'google';
          onboarding_step: number;
          onboarding_completed: boolean;
          skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
          participant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_id?: string;
          auth_provider?: 'email' | 'google';
          onboarding_step?: number;
          onboarding_completed?: boolean;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          participant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_id?: string;
          auth_provider?: 'email' | 'google';
          onboarding_step?: number;
          onboarding_completed?: boolean;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          participant_id?: string | null;
          updated_at?: string;
        };
      };

      /* ── user_stats ───────────────────────────────────────── */
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          level: number;
          hearts: number;
          max_hearts: number;
          hearts_last_refill: string | null;
          lessons_completed: number;
          questions_answered: number;
          questions_correct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          level?: number;
          hearts?: number;
          max_hearts?: number;
          hearts_last_refill?: string | null;
          lessons_completed?: number;
          questions_answered?: number;
          questions_correct?: number;
        };
        Update: {
          total_xp?: number;
          level?: number;
          hearts?: number;
          max_hearts?: number;
          hearts_last_refill?: string | null;
          lessons_completed?: number;
          questions_answered?: number;
          questions_correct?: number;
          updated_at?: string;
        };
      };

      /* ── streaks ──────────────────────────────────────────── */
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          streak_shield_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_shield_active?: boolean;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_shield_active?: boolean;
          updated_at?: string;
        };
      };

      /* ── units ────────────────────────────────────────────── */
      units: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subject: 'fractions' | 'algebra';
          description: string | null;
          color: string;
          icon: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subject: 'fractions' | 'algebra';
          description?: string | null;
          color?: string;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          slug?: string;
          title?: string;
          subject?: 'fractions' | 'algebra';
          description?: string | null;
          color?: string;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
      };

      /* ── sections ─────────────────────────────────────────── */
      sections: {
        Row: {
          id: string;
          unit_id: string;
          slug: string;
          title: string;
          description: string | null;
          sort_order: number;
          xp_per_level: number;
          levels_per_section: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          unit_id: string;
          slug: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          xp_per_level?: number;
          levels_per_section?: number;
          is_active?: boolean;
        };
        Update: {
          unit_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          xp_per_level?: number;
          levels_per_section?: number;
          is_active?: boolean;
        };
      };

      /* ── question_templates ───────────────────────────────── */
      question_templates: {
        Row: {
          id: string;
          section_id: string;
          question_type: QuestionType;
          difficulty_band: 1 | 2 | 3 | 4 | 5;
          template_text: string;
          param_schema: Json;
          answer_formula: string;
          explanation_template: string;
          hints: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          question_type: QuestionType;
          difficulty_band?: 1 | 2 | 3 | 4 | 5;
          template_text: string;
          param_schema: Json;
          answer_formula: string;
          explanation_template: string;
          hints?: string[];
          is_active?: boolean;
        };
        Update: {
          section_id?: string;
          question_type?: QuestionType;
          difficulty_band?: 1 | 2 | 3 | 4 | 5;
          template_text?: string;
          param_schema?: Json;
          answer_formula?: string;
          explanation_template?: string;
          hints?: string[];
          is_active?: boolean;
        };
      };

      /* ── user_progress ────────────────────────────────────── */
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          current_level: number;
          highest_level: number;
          is_unlocked: boolean;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          current_level?: number;
          highest_level?: number;
          is_unlocked?: boolean;
          is_completed?: boolean;
        };
        Update: {
          current_level?: number;
          highest_level?: number;
          is_unlocked?: boolean;
          is_completed?: boolean;
          updated_at?: string;
        };
      };

      /* ── lesson_sessions ──────────────────────────────────── */
      lesson_sessions: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          level: number;
          status: 'in_progress' | 'completed' | 'abandoned';
          xp_earned: number;
          hearts_lost: number;
          questions_total: number;
          questions_correct: number;
          time_taken_seconds: number | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          level: number;
          status?: 'in_progress' | 'completed' | 'abandoned';
          xp_earned?: number;
          hearts_lost?: number;
          questions_total?: number;
          questions_correct?: number;
          time_taken_seconds?: number | null;
        };
        Update: {
          status?: 'in_progress' | 'completed' | 'abandoned';
          xp_earned?: number;
          hearts_lost?: number;
          questions_total?: number;
          questions_correct?: number;
          time_taken_seconds?: number | null;
          completed_at?: string | null;
        };
      };

      /* ── question_attempts ────────────────────────────────── */
      question_attempts: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          template_id: string;
          generated_params: Json;
          correct_answer: string;
          user_answer: string | null;
          is_correct: boolean;
          attempt_number: number;
          time_taken_ms: number | null;
          hint_used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          template_id: string;
          generated_params: Json;
          correct_answer: string;
          user_answer?: string | null;
          is_correct?: boolean;
          attempt_number?: number;
          time_taken_ms?: number | null;
          hint_used?: boolean;
        };
        Update: {
          user_answer?: string | null;
          is_correct?: boolean;
          time_taken_ms?: number | null;
          hint_used?: boolean;
        };
      };

      /* ── achievements ─────────────────────────────────────── */
      achievements: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          icon: string;
          category: 'streak' | 'accuracy' | 'speed' | 'completion' | 'mastery' | 'special';
          xp_reward: number;
          condition_type: string;
          condition_value: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          icon: string;
          category: 'streak' | 'accuracy' | 'speed' | 'completion' | 'mastery' | 'special';
          xp_reward?: number;
          condition_type: string;
          condition_value: number;
          is_active?: boolean;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string;
          icon?: string;
          category?: 'streak' | 'accuracy' | 'speed' | 'completion' | 'mastery' | 'special';
          xp_reward?: number;
          condition_type?: string;
          condition_value?: number;
          is_active?: boolean;
        };
      };

      /* ── user_achievements ────────────────────────────────── */
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: never;
      };

      /* ── daily_challenges ─────────────────────────────────── */
      daily_challenges: {
        Row: {
          id: string;
          challenge_date: string;
          section_id: string;
          template_ids: string[];
          bonus_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_date: string;
          section_id: string;
          template_ids: string[];
          bonus_xp?: number;
        };
        Update: {
          template_ids?: string[];
          bonus_xp?: number;
        };
      };

      /* ── survey_responses ─────────────────────────────────── */
      survey_responses: {
        Row: {
          id: string;
          participant_id: string;
          survey_type: 'post';
          responses: Json;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          survey_type?: 'post';
          responses: Json;
          submitted_at?: string;
        };
        Update: never;
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      question_type: QuestionType;
    };
  };
}

/* ── Shared enums ──────────────────────────────────────────── */
export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'fraction_visual'
  | 'drag_drop'
  | 'true_false'
  | 'match_pairs'
  | 'ordering';

export type Subject = 'fractions' | 'algebra';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type AuthProvider = 'email' | 'google';
export type AchievementCategory = 'streak' | 'accuracy' | 'speed' | 'completion' | 'mastery' | 'special';
