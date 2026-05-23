/**
 * Fraction Operations — question templates.
 * Bands 1–3, targeting Nigerian JSS2 students.
 *
 * answerFormula notes:
 *   - "a/b" with integer params → engine simplifies via simplifyFraction
 *   - add(n1,d1,n2,d2) → engine calls addFractions and returns simplified string
 *   - mul(n1,d1,n2,d2) → engine calls multiplyFractions and returns simplified string
 *   - simplify(n,d)   → engine calls simplifyFraction
 */

import type { QuestionTemplate } from '@/types/question.types';

export const fractionsOperationsTemplates: Omit<QuestionTemplate, 'id' | 'sectionId'>[] = [
  /* ── BAND 1: same denominator ─────────────────────────────────────────── */

  /* 1. Add fractions — same denominator (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'Calculate: {{a}}/{{d}} + {{b}}/{{d}}',
    paramSchema: {
      d: { type: 'int', min: 4, max: 12, nonzero: true },
      a: { type: 'int', min: 1, max: 4 },
      b: { type: 'int', min: 1, max: 4 },
    },
    // add(a, d, b, d) — uses engine's addFractions helper
    answerFormula: 'add(a, d, b, d)',
    explanationTemplate:
      'When denominators are the same, just add the numerators: {{a}} + {{b}} = {{a+b}}, keeping the denominator {{d}}. So the answer is {{a+b}}/{{d}} (simplified if possible).',
    hints: [
      'Same denominator? No wahala — just add the top numbers!',
      'Keep the denominator the same; only the numerators change.',
    ],
    isActive: true,
  },

  /* 2. Subtract fractions — same denominator (fill_blank, a > b) */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'Calculate: {{a}}/{{d}} − {{b}}/{{d}}',
    paramSchema: {
      d: { type: 'int', min: 4, max: 12, nonzero: true },
      b: { type: 'int', min: 1, max: 3 },
      a: { type: 'int', min: 4, max: 8 },
    },
    answerFormula: 'add(a, d, -b, d)',
    explanationTemplate:
      'Same denominators — just subtract the numerators: {{a}} − {{b}} = {{a-b}}, keeping denominator {{d}}. Answer: {{a-b}}/{{d}} (simplified if possible).',
    hints: [
      'Same denominator? Subtract only the top numbers.',
      'Oya: {{a}} − {{b}} = {{a-b}}. That is your new numerator.',
    ],
    isActive: true,
  },

  /* 3. MC: correct method to add 1/4 + 2/4 */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'Which is the correct way to add 1/4 + 2/4?',
    paramSchema: {},
    answerFormula: '"3/4"',
    explanationTemplate:
      '1/4 + 2/4: the denominators are the same (both 4), so just add numerators: 1 + 2 = 3. Answer is 3/4. Easy like that!',
    hints: [
      'Same denominator means you only add the numerators.',
      'Do NOT add the denominators — the bottom stays the same!',
    ],
    isActive: true,
  },

  /* 4. True/false: adding same-denominator fractions */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText:
      'True or False: To add fractions with the same denominator, you just add the numerators and keep the denominator the same.',
    paramSchema: {},
    answerFormula: '"True"',
    explanationTemplate:
      'True! For same-denominator fractions, only the numerators are added. The denominator stays the same. For example, 2/7 + 3/7 = 5/7.',
    hints: [
      'Think of slices of bread: 2 slices + 3 slices = 5 slices. The "out of 7" does not change.',
      'Ehen! Denominator stays — only numerators change.',
    ],
    isActive: true,
  },

  /* ── BAND 2: different denominators ──────────────────────────────────── */

  /* 5. Add fractions: a/2 + b/4 */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'Calculate: {{a}}/2 + {{b}}/4',
    paramSchema: {
      a: { type: 'int', min: 1, max: 3 },
      b: { type: 'int', min: 1, max: 3 },
    },
    answerFormula: 'add(a, 2, b, 4)',
    explanationTemplate:
      'The LCD of 2 and 4 is 4. Convert {{a}}/2 to {{a*2}}/4, then add: {{a*2}}/4 + {{b}}/4 = {{a*2+b}}/4. Simplify if possible.',
    hints: [
      'Find the LCD (Lowest Common Denominator) first. LCD of 2 and 4 is 4.',
      'Convert {{a}}/2 → multiply top and bottom by 2 → {{a*2}}/4, then add.',
      'No wahala — once denominators match, just add numerators!',
    ],
    isActive: true,
  },

  /* 6. Add unit fractions with different small-prime denominators */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'Calculate: 1/{{b}} + 1/{{c}}',
    paramSchema: {
      b: { type: 'choice', options: [2, 3, 5] },
      c: { type: 'choice', options: [3, 4, 6] },
    },
    answerFormula: 'add(1, b, 1, c)',
    explanationTemplate:
      'Find the LCD of {{b}} and {{c}}, convert both fractions, then add the numerators. Oya, let\'s try: 1/{{b}} + 1/{{c}} — work it out step by step!',
    hints: [
      'Step 1: Find the LCD of {{b}} and {{c}}.',
      'Step 2: Convert each fraction to the LCD.',
      'Step 3: Add the numerators, keep the LCD as denominator.',
    ],
    isActive: true,
  },

  /* 7. MC: LCD of 1/3 and 1/4 */
  {
    type: 'multiple_choice',
    difficultyBand: 2,
    templateText: 'What is the Lowest Common Denominator (LCD) of 1/3 and 1/4?',
    paramSchema: {},
    answerFormula: '"12"',
    explanationTemplate:
      'The LCD of 3 and 4 is their LCM. Multiples of 3: 3, 6, 9, 12 ... Multiples of 4: 4, 8, 12 ... First common multiple is 12. So LCD = 12!',
    hints: [
      'LCD = the smallest number that BOTH denominators divide into evenly.',
      'List multiples of 3 and 4 until you find the first one they share.',
      'Ehen! 3 × 4 = 12, and since 3 and 4 share no common factors, LCD = 12.',
    ],
    isActive: true,
  },

  /* 8. Subtract fractions — different denominators */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'Calculate: {{a}}/{{p}} − {{b}}/{{q}}',
    paramSchema: {
      p: { type: 'choice', options: [2, 3, 4] },
      q: { type: 'choice', options: [6, 8, 12] },
      a: { type: 'int', min: 1, max: 3 },
      b: { type: 'int', min: 1, max: 2 },
    },
    answerFormula: 'add(a, p, -b, q)',
    explanationTemplate:
      'Find the LCD of {{p}} and {{q}}. Convert {{a}}/{{p}} using the LCD, then subtract {{b}}/{{q}}. Simplify your answer.',
    hints: [
      'Step 1: Find LCD of {{p}} and {{q}}.',
      'Convert both fractions to that LCD, then subtract numerators.',
      'No wahala — same steps as adding, just subtract instead.',
    ],
    isActive: true,
  },

  /* ── BAND 3: multiply and simplify ───────────────────────────────────── */

  /* 9. Multiply fractions (fill_blank, answer simplified) */
  {
    type: 'fill_blank',
    difficultyBand: 3,
    templateText: 'Calculate: {{a}}/{{b}} × {{c}}/{{d}}',
    paramSchema: {
      a: { type: 'int', min: 1, max: 5 },
      b: { type: 'int', min: 2, max: 6, nonzero: true },
      c: { type: 'int', min: 1, max: 5 },
      d: { type: 'int', min: 2, max: 6, nonzero: true },
    },
    answerFormula: 'mul(a, b, c, d)',
    explanationTemplate:
      'Multiply across: numerator = {{a}} × {{c}} = {{a*c}}, denominator = {{b}} × {{d}} = {{b*d}}. Then simplify {{a*c}}/{{b*d}}.',
    hints: [
      'To multiply fractions: multiply numerators together, then denominators together.',
      '{{a}}/{{b}} × {{c}}/{{d}} = ({{a}}×{{c}}) / ({{b}}×{{d}}).',
      'Oya, calculate then simplify your fraction at the end!',
    ],
    isActive: true,
  },

  /* 10. Simplify a fraction (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 3,
    templateText: 'Simplify the fraction {{a*k}}/{{b*k}}.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 6 },
      b: { type: 'int', min: 2, max: 8, nonzero: true },
      k: { type: 'int', min: 2, max: 4 },
    },
    answerFormula: 'simplify(a*k, b*k)',
    explanationTemplate:
      'Find the HCF of {{a*k}} and {{b*k}}. Divide both by the HCF to simplify. The simplest form is {{a}}/{{b}}.',
    hints: [
      'Find the Highest Common Factor (HCF) of the numerator and denominator.',
      'Divide both numerator and denominator by the HCF.',
      'Ehen! Keep dividing until no common factor remains.',
    ],
    isActive: true,
  },

  /* 11. Mixed number addition (MC) */
  {
    type: 'multiple_choice',
    difficultyBand: 3,
    templateText: 'Calculate: 1{{a}}/{{d}} + 1{{b}}/{{d}}',
    paramSchema: {
      d: { type: 'int', min: 5, max: 10, nonzero: true },
      a: { type: 'int', min: 1, max: 3 },
      b: { type: 'int', min: 1, max: 3 },
    },
    answerFormula: 'add(a + d, d, b + d, d)',
    explanationTemplate:
      'Add the whole numbers: 1 + 1 = 2. Add the fractions: {{a}}/{{d}} + {{b}}/{{d}} = {{a+b}}/{{d}}. Combine: 2 and {{a+b}}/{{d}}.',
    hints: [
      'Add whole-number parts first, then fraction parts separately.',
      'Same denominator in the fraction parts — just add numerators!',
      'If the fraction part is improper (top ≥ bottom), convert it and add to the whole number.',
    ],
    isActive: true,
  },

  /* 12. MC: equivalent to 3/6 */
  {
    type: 'multiple_choice',
    difficultyBand: 3,
    templateText: 'Which fraction is equivalent to 3/6?',
    paramSchema: {},
    answerFormula: '"1/2"',
    explanationTemplate:
      '3/6 simplifies to 1/2 because the HCF of 3 and 6 is 3. Divide both by 3: 3÷3 = 1, 6÷3 = 2. So 3/6 = 1/2. Let\'s go!',
    hints: [
      'Find the HCF of 3 and 6, then divide both numerator and denominator by it.',
      'HCF of 3 and 6 is 3. So 3/6 = (3÷3)/(6÷3) = 1/2.',
    ],
    isActive: true,
  },
];
