/**
 * Introduction to Fractions — question templates.
 * Band 1 (introductory), targeting Nigerian JSS2 students.
 */

import type { QuestionTemplate } from '@/types/question.types';

export const fractionsIntroTemplates: Omit<QuestionTemplate, 'id' | 'sectionId'>[] = [
  /* 1. Identify numerator ────────────────────────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'What is the numerator of the fraction {{a}}/{{b}}?',
    paramSchema: {
      a: { type: 'int', min: 1, max: 9 },
      b: { type: 'int', min: 2, max: 12, nonzero: true },
    },
    answerFormula: 'a',
    explanationTemplate:
      'In the fraction {{a}}/{{b}}, the top number is the numerator. So the answer is {{a}}.',
    hints: [
      'The numerator is the TOP number in a fraction. Easy one!',
      'Ehen! Numerator → top. Denominator → bottom.',
    ],
    isActive: true,
  },

  /* 2. Identify denominator ──────────────────────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'What is the denominator of the fraction {{a}}/{{b}}?',
    paramSchema: {
      a: { type: 'int', min: 1, max: 9 },
      b: { type: 'int', min: 2, max: 12, nonzero: true },
    },
    answerFormula: 'b',
    explanationTemplate:
      'In the fraction {{a}}/{{b}}, the bottom number is the denominator. So the answer is {{b}}.',
    hints: [
      'Count how many equal parts in total — that is your denominator.',
      'Ehen! Remember: denominator is at the BOTTOM of the fraction.',
    ],
    isActive: true,
  },

  /* 3. True/false: meaning of a fraction ────────────────────────────────── */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText: 'True or False: The fraction 3/5 means 3 out of 5 equal parts.',
    paramSchema: {},
    answerFormula: '"True"',
    explanationTemplate:
      'True! A fraction like 3/5 tells us we have 3 shaded parts out of 5 equal parts in total. No wahala — fractions just count parts!',
    hints: [
      'Think of a pizza cut into 5 equal slices. 3/5 means you ate 3 slices.',
      'Numerator = parts taken. Denominator = total equal parts.',
    ],
    isActive: true,
  },

  /* 4. Which fraction represents shaded parts? (MC, text description) ───── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText:
      'A shape is divided into {{b}} equal parts, and {{a}} parts are shaded. Which fraction shows the shaded portion?',
    paramSchema: {
      a: { type: 'int', min: 1, max: 5 },
      b: { type: 'int', min: 3, max: 10, nonzero: true },
    },
    answerFormula: '"{{a}}/{{b}}"',
    explanationTemplate:
      'Shaded parts = {{a}}, total equal parts = {{b}}. So the fraction is {{a}}/{{b}}. Oya, you see how easy that is!',
    hints: [
      'Write: (shaded parts) / (total parts).',
      'The denominator is the TOTAL number of equal parts.',
    ],
    isActive: true,
  },

  /* 5. What does the denominator tell us? (MC) ───────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'What does the denominator of a fraction tell us?',
    paramSchema: {},
    answerFormula: '"The total number of equal parts the whole is divided into"',
    explanationTemplate:
      'The denominator is the bottom number. It tells us how many EQUAL parts the whole shape or quantity has been split into. Let\'s go!',
    hints: [
      'Denominator = bottom number = total equal parts.',
      'Think: "de-nom-inator" → how many "nominal" (named) parts exist in total.',
    ],
    isActive: true,
  },

  /* 6. Write the fraction for a out of b (fill_blank) ───────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText:
      'Write the fraction for {{a}} out of {{b}}. (Use the format a/b)',
    paramSchema: {
      a: { type: 'int', min: 1, max: 8 },
      b: { type: 'int', min: 2, max: 12, nonzero: true },
    },
    answerFormula: '"{{a}}/{{b}}"',
    explanationTemplate:
      '{{a}} out of {{b}} is written as {{a}}/{{b}}. The top number (numerator) is {{a}} and the bottom (denominator) is {{b}}.',
    hints: [
      'Format: (parts you have) / (total parts).',
      'Oya, just write the two numbers with a "/" between them.',
    ],
    isActive: true,
  },

  /* 7. Is a/b more than 0? (true_false, always true for positive fractions) */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText: 'True or False: The fraction {{a}}/{{b}} is greater than 0.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 9, positive: true },
      b: { type: 'int', min: 2, max: 12, positive: true, nonzero: true },
    },
    answerFormula: '"True"',
    explanationTemplate:
      'Since both {{a}} (numerator) and {{b}} (denominator) are positive numbers, {{a}}/{{b}} is a positive fraction — so it is definitely greater than 0.',
    hints: [
      'A fraction with positive numerator and positive denominator is always greater than 0.',
      'Think: you have {{a}} pieces of something. That is more than nothing!',
    ],
    isActive: true,
  },

  /* 8. Is a/b < 1 when a < b? (true_false) ──────────────────────────────── */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText: 'True or False: The fraction {{a}}/{{b}} is less than 1.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 7 },
      b: { type: 'int', min: 8, max: 15, positive: true, nonzero: true },
    },
    answerFormula: '"True"',
    explanationTemplate:
      '{{a}}/{{b}} is a proper fraction because {{a}} < {{b}}. When the numerator is SMALLER than the denominator, the fraction is less than 1. Ehen!',
    hints: [
      'If the top number is smaller than the bottom, the fraction is less than 1.',
      'Compare: {{a}} pieces out of {{b}} total — you have not even reached the whole!',
    ],
    isActive: true,
  },

  /* 9. Equivalent fraction spotting (MC) ─────────────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'Which fraction is equivalent to 1/2?',
    paramSchema: {},
    answerFormula: '"2/4"',
    explanationTemplate:
      '2/4 = 1/2 because you can simplify 2/4 by dividing both top and bottom by 2. Both fractions represent the same amount — half of a whole!',
    hints: [
      'Multiply or divide the numerator AND denominator by the same number to get an equivalent fraction.',
      '1/2 → multiply top and bottom by 2 → 2/4. No wahala!',
    ],
    isActive: true,
  },

  /* 10. Unit fraction vocabulary (MC) ────────────────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'A fraction with 1 as the numerator is called a ___.',
    paramSchema: {},
    answerFormula: '"unit fraction"',
    explanationTemplate:
      'A unit fraction has 1 on top (numerator = 1), like 1/2, 1/3, or 1/7. The word "unit" means ONE. Ehen — now you know!',
    hints: [
      '"Unit" means one. A unit fraction has numerator = 1.',
      'Examples: 1/4, 1/10, 1/100 — all unit fractions.',
    ],
    isActive: true,
  },
];
