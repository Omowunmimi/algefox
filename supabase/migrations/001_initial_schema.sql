-- ============================================================
-- AlgeFox Initial Schema
-- Run in Supabase SQL Editor or via supabase db push
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             TEXT NOT NULL,
  avatar_id            TEXT NOT NULL DEFAULT 'avatar-01',
  auth_provider        TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
  onboarding_step      INTEGER NOT NULL DEFAULT 1,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  skill_level          TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  participant_id       TEXT UNIQUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner can read/write"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-generate a short participant ID (P + 6 random uppercase chars)
CREATE OR REPLACE FUNCTION public.generate_participant_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  new_id TEXT;
  attempts INTEGER := 0;
BEGIN
  IF NEW.participant_id IS NULL THEN
    LOOP
      new_id := 'P' || upper(substring(md5(random()::text) FROM 1 FOR 6));
      BEGIN
        NEW.participant_id := new_id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts > 10 THEN
          NEW.participant_id := 'P' || upper(substring(md5(gen_random_uuid()::text) FROM 1 FOR 8));
          EXIT;
        END IF;
      END;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_participant_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_participant_id();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── user_stats ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp            INTEGER NOT NULL DEFAULT 0,
  level               INTEGER NOT NULL DEFAULT 1,
  hearts              INTEGER NOT NULL DEFAULT 5,
  max_hearts          INTEGER NOT NULL DEFAULT 5,
  hearts_last_refill  TIMESTAMPTZ,
  lessons_completed   INTEGER NOT NULL DEFAULT 0,
  questions_answered  INTEGER NOT NULL DEFAULT 0,
  questions_correct   INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_stats: owner can read/write"
  ON public.user_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── streaks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_activity_date  DATE,
  streak_shield_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks: owner can read/write"
  ON public.streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── units ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.units (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  subject     TEXT NOT NULL CHECK (subject IN ('fractions', 'algebra')),
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#F97316',
  icon        TEXT NOT NULL DEFAULT '🔢',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "units: public read" ON public.units FOR SELECT USING (TRUE);

-- ── sections ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sections (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id            UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  description        TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  xp_per_level       INTEGER NOT NULL DEFAULT 30,
  levels_per_section INTEGER NOT NULL DEFAULT 20,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections: public read" ON public.sections FOR SELECT USING (TRUE);

-- ── question_templates ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_templates (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id           UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  question_type        TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice','fill_blank','fraction_visual','drag_drop',
    'true_false','match_pairs','ordering'
  )),
  difficulty_band      INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_band BETWEEN 1 AND 5),
  template_text        TEXT NOT NULL,
  param_schema         JSONB NOT NULL DEFAULT '{}',
  answer_formula       TEXT NOT NULL,
  explanation_template TEXT NOT NULL DEFAULT '',
  hints                TEXT[] NOT NULL DEFAULT '{}',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "question_templates: public read" ON public.question_templates FOR SELECT USING (TRUE);

-- ── user_progress ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id     UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  current_level  INTEGER NOT NULL DEFAULT 1,
  highest_level  INTEGER NOT NULL DEFAULT 0,
  is_unlocked    BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress: owner can read/write"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── lesson_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id          UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  level               INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'in_progress'
                      CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  xp_earned          INTEGER NOT NULL DEFAULT 0,
  hearts_lost        INTEGER NOT NULL DEFAULT 0,
  questions_total    INTEGER NOT NULL DEFAULT 0,
  questions_correct  INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);

ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_sessions: owner can read/write"
  ON public.lesson_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── question_attempts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id      UUID NOT NULL REFERENCES public.question_templates(id) ON DELETE CASCADE,
  generated_params JSONB NOT NULL DEFAULT '{}',
  correct_answer   TEXT NOT NULL,
  user_answer      TEXT,
  is_correct       BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_number   INTEGER NOT NULL DEFAULT 1,
  time_taken_ms    INTEGER,
  hint_used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "question_attempts: owner can read/write"
  ON public.question_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── achievements ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT '🏆',
  category        TEXT NOT NULL CHECK (category IN (
    'streak', 'accuracy', 'speed', 'completion', 'mastery', 'special'
  )),
  xp_reward       INTEGER NOT NULL DEFAULT 50,
  condition_type  TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements: public read" ON public.achievements FOR SELECT USING (TRUE);

-- Seed initial achievements
INSERT INTO public.achievements (slug, title, description, icon, category, xp_reward, condition_type, condition_value) VALUES
  ('first-lesson',   'First Step',       'Complete your first lesson',            '🎯', 'completion', 50,  'lessons_completed',   1),
  ('streak-3',       'On a Roll',        'Maintain a 3-day streak',               '🔥', 'streak',     75,  'streak_days',         3),
  ('streak-7',       'Week Warrior',     '7-day streak!',                         '🌟', 'streak',     150, 'streak_days',         7),
  ('perfect-lesson', 'Perfect Score',    'Complete a lesson with no mistakes',    '💯', 'accuracy',   100, 'perfect_lesson',      1),
  ('level-10',       'Level 10 Legend',  'Reach Level 10',                        '🏆', 'mastery',    200, 'level',               10),
  ('xp-500',         'XP Collector',     'Earn 500 total XP',                     '⚡', 'mastery',    50,  'total_xp',            500),
  ('questions-50',   'Question Master',  'Answer 50 questions',                   '❓', 'completion', 100, 'questions_answered',  50),
  ('accuracy-90',    'Sharp Mind',       'Maintain 90% accuracy (10+ questions)', '🎓', 'accuracy',   150, 'accuracy_pct',        90)
ON CONFLICT (slug) DO NOTHING;

-- ── user_achievements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements: owner can read/write"
  ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── daily_challenges ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_date DATE NOT NULL UNIQUE,
  section_id     UUID NOT NULL REFERENCES public.sections(id),
  template_ids   UUID[] NOT NULL DEFAULT '{}',
  bonus_xp       INTEGER NOT NULL DEFAULT 50,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_challenges: public read" ON public.daily_challenges FOR SELECT USING (TRUE);

-- ── survey_responses ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  q1           INTEGER CHECK (q1 BETWEEN 1 AND 5),
  q2           INTEGER CHECK (q2 BETWEEN 1 AND 5),
  q3           INTEGER CHECK (q3 BETWEEN 1 AND 5),
  q4           INTEGER CHECK (q4 BETWEEN 1 AND 5),
  q5           INTEGER CHECK (q5 BETWEEN 1 AND 5),
  open_text    TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_responses: owner insert"
  ON public.survey_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "survey_responses: owner read"
  ON public.survey_responses FOR SELECT
  USING (auth.uid() = user_id);

-- ── RPC: increment_user_stats ────────────────────────────────────
-- Called after lesson completion to atomically update aggregate stats
CREATE OR REPLACE FUNCTION public.increment_user_stats(
  p_user_id          UUID,
  p_lessons          INTEGER DEFAULT 1,
  p_questions_answered INTEGER DEFAULT 0,
  p_questions_correct  INTEGER DEFAULT 0
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.user_stats
  SET
    lessons_completed  = lessons_completed  + p_lessons,
    questions_answered = questions_answered + p_questions_answered,
    questions_correct  = questions_correct  + p_questions_correct,
    updated_at         = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- ── Content seed: units ──────────────────────────────────────────
INSERT INTO public.units (slug, title, subject, description, color, icon, sort_order) VALUES
  ('fractions', 'Fractions',       'fractions', 'Master fractions from basics to operations', '#F97316', '🍕', 1),
  ('algebra',   'Algebra Basics',  'algebra',   'Build algebra fundamentals step by step',    '#7C3AED', '✏️', 2)
ON CONFLICT (slug) DO NOTHING;

-- ── Content seed: sections ───────────────────────────────────────
-- (IDs are stable — referenced in the app via slug lookup)
INSERT INTO public.sections (unit_id, slug, title, description, sort_order, xp_per_level, levels_per_section)
SELECT u.id, s.slug, s.title, s.description, s.sort_order, s.xp_per_level, s.levels_per_section
FROM public.units u
JOIN (VALUES
  ('fractions', 'fractions-intro',       'Introduction to Fractions',  'What fractions are and how they work', 1, 20, 20),
  ('fractions', 'fractions-operations',  'Fraction Operations',         'Adding, subtracting, multiplying, dividing', 2, 30, 20),
  ('algebra',   'algebra-intro',         'Introduction to Algebra',     'Variables, expressions, simple equations', 3, 30, 20),
  ('algebra',   'algebra-expressions',   'Algebraic Expressions',       'Simplify and evaluate complex expressions', 4, 40, 20)
) AS s(unit_slug, slug, title, description, sort_order, xp_per_level, levels_per_section)
ON u.slug = s.unit_slug
ON CONFLICT (slug) DO NOTHING;
