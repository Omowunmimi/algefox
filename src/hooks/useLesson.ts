'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLessonStore } from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { generateLesson } from '@/lib/engine/generator';
import { createClient } from '@/lib/supabase/client';
import type { QuestionTemplate, ParamSchema } from '@/types/question.types';

// Content template fallbacks
import { fractionsIntroTemplates } from '@/content/templates/fractions/intro';
import { fractionsOperationsTemplates } from '@/content/templates/fractions/operations';
import { algebraIntroTemplates } from '@/content/templates/algebra/intro';
import { algebraExpressionsTemplates } from '@/content/templates/algebra/expressions';

/* ── Template fallback map ──────────────────────────────────── */

type RawTemplate = Omit<QuestionTemplate, 'id' | 'sectionId'>;

const TEMPLATE_MAP: Record<string, RawTemplate[]> = {
  'fractions-intro': fractionsIntroTemplates,
  'fractions-operations': fractionsOperationsTemplates,
  'algebra-intro': algebraIntroTemplates,
  'algebra-expressions': algebraExpressionsTemplates,
};

function getFallbackTemplates(
  sectionId: string,
  fallbackSectionId: string,
): QuestionTemplate[] {
  const raw = TEMPLATE_MAP[sectionId] ?? algebraIntroTemplates;
  return raw.map((t, i): QuestionTemplate => ({
    ...t,
    id: `local-${sectionId}-${i}`,
    sectionId: fallbackSectionId,
  }));
}

/* ── Hook ───────────────────────────────────────────────────── */

interface UseLessonReturn {
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

export function useLesson(sectionId: string, level: number): UseLessonReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initSession = useLessonStore((s) => s.initSession);
  const user = useUserStore((s) => s.profile);

  const init = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);

    try {
      const supabase = createClient();
      let templates: QuestionTemplate[] = [];
      let dbSectionId = sectionId;
      let sectionTitle = sectionId;

      // 1. Try to fetch templates from Supabase
      const { data: sectionData } = await supabase
        .from('sections')
        .select('id, title')
        .eq('slug', sectionId)
        .single();

      if (sectionData) {
        dbSectionId = sectionData.id;
        sectionTitle = sectionData.title;

        const { data: dbTemplates } = await supabase
          .from('question_templates')
          .select('*')
          .eq('section_id', sectionData.id)
          .eq('is_active', true);

        if (dbTemplates && dbTemplates.length > 0) {
          templates = dbTemplates.map(
            (row): QuestionTemplate => ({
              id: row.id,
              sectionId: row.section_id,
              type: row.question_type,
              difficultyBand: row.difficulty_band as 1 | 2 | 3 | 4 | 5,
              templateText: row.template_text,
              paramSchema: (row.param_schema ?? {}) as unknown as ParamSchema,
              answerFormula: row.answer_formula,
              explanationTemplate: row.explanation_template,
              hints: row.hints ?? [],
              isActive: row.is_active,
            }),
          );
        }
      }

      // 2. Fallback to local content templates if DB returned nothing
      if (templates.length === 0) {
        templates = getFallbackTemplates(sectionId, dbSectionId);
        // Derive a human-readable title from the slug
        sectionTitle = sectionId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      // 3. Generate lesson question instances
      const questions = generateLesson(templates, level);

      // 4. Create lesson_sessions record in Supabase (best-effort)
      let sessionId = `local-${Date.now()}`;
      if (user?.id) {
        const { data: session } = await supabase
          .from('lesson_sessions')
          .insert({
            user_id: user.id,
            section_id: dbSectionId,
            level,
            status: 'in_progress',
          })
          .select('id')
          .single();

        if (session?.id) {
          sessionId = session.id;
        }
      }

      // 5. Initialize the store
      initSession({
        sessionId,
        sectionId: dbSectionId,
        sectionTitle,
        level,
        questions,
      });

      setIsReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lesson';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, level, user?.id, initSession]);

  useEffect(() => {
    void init();
  }, [init]);

  return { isLoading, error, isReady };
}
