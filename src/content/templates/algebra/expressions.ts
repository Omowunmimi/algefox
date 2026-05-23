/**
 * Algebraic Expressions — question templates.
 * Bands 1–4, targeting Nigerian JSS2 students.
 *
 * answerFormula notes:
 *   - String literals wrapped in double quotes (e.g. '"3x + 6"') return the raw string.
 *   - For substitution questions that yield integers, use arithmetic formulas.
 *   - Expression-format answers (like "{{a}}x + {{a*b}}") are built from the
 *     interpolated templateText but the answerFormula itself must be evaluable.
 *     Where the result is a string expression, wrap in a quoted template literal pattern:
 *     the engine returns the formula after param substitution as a string when it
 *     contains letters.
 */

import type { QuestionTemplate } from '@/types/question.types';

export const algebraExpressionsTemplates: Omit<QuestionTemplate, 'id' | 'sectionId'>[] = [
  /* ── BAND 1–2 ─────────────────────────────────────────────────────────── */

  /* 1. Collect like terms: ax + bx (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'Simplify: {{a}}x + {{b}}x',
    paramSchema: {
      a: { type: 'int', min: 2, max: 9 },
      b: { type: 'int', min: 1, max: 8 },
    },
    // result is (a+b)x — the engine will substitute and return the string
    answerFormula: '"{{a+b}}x"',
    explanationTemplate:
      '{{a}}x and {{b}}x are like terms (both have x). Add the coefficients: {{a}} + {{b}} = {{a+b}}. So {{a}}x + {{b}}x = {{a+b}}x.',
    hints: [
      'Like terms can be collected (added/subtracted).',
      'Add the coefficients: {{a}} + {{b}}.',
      'The variable x stays the same — only the numbers in front change.',
    ],
    isActive: true,
  },

  /* 2. Collect like terms with a constant: ax + b + cx (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'Simplify: {{a}}x + {{b}} + {{c}}x',
    paramSchema: {
      a: { type: 'int', min: 1, max: 7 },
      b: { type: 'int', min: 1, max: 10 },
      c: { type: 'int', min: 1, max: 7 },
    },
    answerFormula: '"{{a+c}}x + {{b}}"',
    explanationTemplate:
      'Collect the x terms: {{a}}x + {{c}}x = {{a+c}}x. The constant {{b}} stays alone. Final answer: {{a+c}}x + {{b}}.',
    hints: [
      'Group the x terms together first: {{a}}x + {{c}}x.',
      'Numbers without x are constants — they stay separate.',
      'Ehen! {{a}}x + {{c}}x = {{a+c}}x, plus the constant {{b}}.',
    ],
    isActive: true,
  },

  /* 3. MC: Simplify 5y − 2y */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'Simplify: 5y − 2y',
    paramSchema: {},
    answerFormula: '"3y"',
    explanationTemplate:
      '5y and 2y are like terms. 5 − 2 = 3, so 5y − 2y = 3y. The y stays! Oya, collect those like terms.',
    hints: [
      'Same variable (y)? They are like terms — subtract the coefficients.',
      '5 − 2 = 3. Keep the y. Answer: 3y.',
    ],
    isActive: true,
  },

  /* 4. True/false: 2x + 3y cannot be simplified further */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText: 'True or False: The expression 2x + 3y cannot be simplified further.',
    paramSchema: {},
    answerFormula: '"True"',
    explanationTemplate:
      'True! 2x and 3y are NOT like terms — they have different variables (x vs y). You cannot add or subtract them. The expression 2x + 3y is already in its simplest form.',
    hints: [
      'Like terms must have the SAME variable part.',
      'x and y are different variables — 2x and 3y cannot be combined.',
    ],
    isActive: true,
  },

  /* ── BAND 2–3 ─────────────────────────────────────────────────────────── */

  /* 5. Substitution: cx + dy where x and y are given (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'If x = {{a}} and y = {{b}}, find the value of {{c}}x + {{d}}y.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 8 },
      b: { type: 'int', min: 1, max: 8 },
      c: { type: 'int', min: 1, max: 6 },
      d: { type: 'int', min: 1, max: 6 },
    },
    answerFormula: 'c * a + d * b',
    explanationTemplate:
      'Replace x with {{a}} and y with {{b}}: {{c}}×{{a}} + {{d}}×{{b}} = {{c*a}} + {{d*b}} = {{c*a+d*b}}.',
    hints: [
      'Substitute: swap each letter for its value.',
      '{{c}}x = {{c}} × {{a}} = {{c*a}}. Then {{d}}y = {{d}} × {{b}} = {{d*b}}.',
      'No wahala — substitute, multiply, then add!',
    ],
    isActive: true,
  },

  /* 6. Substitution: a² + ba (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'If a = {{a}}, find the value of a² + {{b}}a.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 7 },
      b: { type: 'int', min: 1, max: 9 },
    },
    answerFormula: 'a * a + b * a',
    explanationTemplate:
      'a² = {{a}} × {{a}} = {{a*a}}. {{b}}a = {{b}} × {{a}} = {{b*a}}. Add: {{a*a}} + {{b*a}} = {{a*a+b*a}}.',
    hints: [
      'a² means a × a.',
      'Oya: a² + {{b}}a = ({{a}} × {{a}}) + ({{b}} × {{a}}) = ?',
      'Calculate each part separately, then add them together.',
    ],
    isActive: true,
  },

  /* 7. Expand: a(x + b) → ax + ab (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'Expand: {{a}}(x + {{b}})',
    paramSchema: {
      a: { type: 'int', min: 2, max: 8 },
      b: { type: 'int', min: 1, max: 10 },
    },
    answerFormula: '"{{a}}x + {{a*b}}"',
    explanationTemplate:
      'Multiply {{a}} by EACH term inside the brackets: {{a}} × x = {{a}}x, and {{a}} × {{b}} = {{a*b}}. So {{a}}(x + {{b}}) = {{a}}x + {{a*b}}.',
    hints: [
      'Distribute (expand): multiply the number outside by EACH term inside.',
      '{{a}}(x + {{b}}) = {{a}}×x + {{a}}×{{b}}.',
      'Oya: {{a}}×x = {{a}}x and {{a}}×{{b}} = {{a*b}}.',
    ],
    isActive: true,
  },

  /* 8. Expand: a(bx − c) (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 2,
    templateText: 'Expand: {{a}}({{b}}x − {{c}})',
    paramSchema: {
      a: { type: 'int', min: 2, max: 6 },
      b: { type: 'int', min: 2, max: 5 },
      c: { type: 'int', min: 1, max: 8 },
    },
    answerFormula: '"{{a*b}}x - {{a*c}}"',
    explanationTemplate:
      'Multiply {{a}} by each term: {{a}} × {{b}}x = {{a*b}}x, and {{a}} × −{{c}} = −{{a*c}}. Result: {{a*b}}x − {{a*c}}.',
    hints: [
      'Watch the minus sign — multiplying by a negative gives a negative result.',
      '{{a}} × {{b}}x = {{a*b}}x. {{a}} × −{{c}} = −{{a*c}}.',
      'Ehen! Be careful with signs when expanding.',
    ],
    isActive: true,
  },

  /* ── BAND 3–4 ─────────────────────────────────────────────────────────── */

  /* 9. Factorise ax + ab → a(x + b) (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 3,
    templateText: 'Factorise: {{a}}x + {{a*b}}',
    paramSchema: {
      a: { type: 'int', min: 2, max: 8 },
      b: { type: 'int', min: 2, max: 7 },
    },
    answerFormula: '"{{a}}(x + {{b}})"',
    explanationTemplate:
      'The HCF of {{a}}x and {{a*b}} is {{a}}. Take {{a}} out: {{a}}x ÷ {{a}} = x, and {{a*b}} ÷ {{a}} = {{b}}. So {{a}}x + {{a*b}} = {{a}}(x + {{b}}).',
    hints: [
      'Factorising is the REVERSE of expanding. Find the HCF first.',
      'HCF of {{a}}x and {{a*b}} is {{a}}.',
      'Take {{a}} outside the bracket: {{a}}(? + ?) = {{a}}x + {{a*b}}.',
    ],
    isActive: true,
  },

  /* 10. Solve: x + a = b (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 3,
    templateText: 'Solve for x: x + {{a}} = {{b}}',
    paramSchema: {
      a: { type: 'int', min: 1, max: 10 },
      b: { type: 'int', min: 5, max: 20 },
    },
    answerFormula: 'b - a',
    explanationTemplate:
      'To find x, subtract {{a}} from both sides: x = {{b}} − {{a}} = {{b-a}}.',
    hints: [
      'Inverse operation: x + {{a}} = {{b}} → x = {{b}} − {{a}}.',
      'Whatever you do to one side, do to the other side too.',
      'No wahala — subtract {{a}} from {{b}}.',
    ],
    isActive: true,
  },

  /* 11. Solve: ax = ab (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 3,
    templateText: 'Solve for x: {{a}}x = {{a*b}}',
    paramSchema: {
      a: { type: 'int', min: 2, max: 8 },
      b: { type: 'int', min: 2, max: 10 },
    },
    answerFormula: 'b',
    explanationTemplate:
      'Divide both sides by {{a}}: x = {{a*b}} ÷ {{a}} = {{b}}.',
    hints: [
      'To isolate x, divide both sides by {{a}}.',
      '{{a}}x = {{a*b}} → x = {{a*b}} ÷ {{a}}.',
      'Ehen! Division is the inverse of multiplication.',
    ],
    isActive: true,
  },

  /* 12. Word problem: find x from total (fill_blank) */
  {
    type: 'fill_blank',
    difficultyBand: 4,
    templateText:
      'Amara has {{a}} sweets. Emeka has x more sweets than Amara. Together they have {{a+b}} sweets. Find x.',
    paramSchema: {
      a: { type: 'int', min: 3, max: 12 },
      b: { type: 'int', min: 2, max: 10 },
    },
    answerFormula: 'b',
    explanationTemplate:
      'Amara has {{a}} sweets. Let Emeka have {{a}} + x sweets. Together: {{a}} + ({{a}} + x) = {{a+b}}. So {{2*a}} + x = {{a+b}}, which gives x = {{a+b}} − {{2*a}} = {{b}}.',
    hints: [
      'Write an equation: Amara\'s sweets + Emeka\'s sweets = total.',
      'Emeka has {{a}} + x sweets (x more than Amara).',
      'Oya, solve: {{a}} + ({{a}} + x) = {{a+b}}.',
    ],
    isActive: true,
  },
];
