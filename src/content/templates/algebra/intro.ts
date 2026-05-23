/**
 * Introduction to Algebra — question templates.
 * Band 1 (introductory), targeting Nigerian JSS2 students.
 */

import type { QuestionTemplate } from '@/types/question.types';

export const algebraIntroTemplates: Omit<QuestionTemplate, 'id' | 'sectionId'>[] = [
  /* 1. What is a variable? (MC) ─────────────────────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'In algebra, what is a variable?',
    paramSchema: {},
    answerFormula: '"a letter that represents a number"',
    explanationTemplate:
      'A variable is a letter (like x, y, or n) that stands in place of a number we do not yet know. Ehen! That is why we use letters in algebra.',
    hints: [
      'Variable → it can VARY (change). It is a letter holding a number.',
      'Think of x as an empty box waiting for its value.',
    ],
    isActive: true,
  },

  /* 2. Basic substitution: x + b (fill_blank) ───────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'If x = {{a}}, find the value of x + {{b}}.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 10 },
      b: { type: 'int', min: 1, max: 10 },
    },
    answerFormula: 'a + b',
    explanationTemplate:
      'Replace x with {{a}}: {{a}} + {{b}} = {{a+b}}. Substitution just means swapping the letter for its value. Easy!',
    hints: [
      'Substitution = replace the letter with the given number.',
      'x = {{a}}, so x + {{b}} = {{a}} + {{b}}.',
    ],
    isActive: true,
  },

  /* 3. Substitution: 2n (fill_blank) ────────────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'If n = {{a}}, find the value of 2n.',
    paramSchema: {
      a: { type: 'int', min: 1, max: 12 },
    },
    answerFormula: '2 * a',
    explanationTemplate:
      '2n means 2 × n. If n = {{a}}, then 2n = 2 × {{a}} = {{2*a}}. Remember: a letter next to a number means multiply!',
    hints: [
      '2n means 2 TIMES n. Not 2 plus n!',
      'Replace n with {{a}}, then multiply by 2.',
    ],
    isActive: true,
  },

  /* 4. True/false: letters can stand for different numbers ───────────────── */
  {
    type: 'true_false',
    difficultyBand: 1,
    templateText: 'True or False: In algebra, a letter (variable) can stand for different numbers in different problems.',
    paramSchema: {},
    answerFormula: '"True"',
    explanationTemplate:
      'True! A variable like x can equal 3 in one problem and 7 in another. That is what makes algebra powerful — letters are flexible. Let\'s go!',
    hints: [
      'x is not always the same number. It depends on the problem.',
      'Variables are like name-tags — the same tag can belong to different people.',
    ],
    isActive: true,
  },

  /* 5. What does 3x mean? (MC) ───────────────────────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'The expression 3x means…',
    paramSchema: {},
    answerFormula: '"3 × x"',
    explanationTemplate:
      'When a number is written directly next to a letter with no sign between them, it means multiplication. So 3x = 3 × x. Ehen — that is the rule!',
    hints: [
      'A number next to a letter = multiplication. No sign needed.',
      '3x is NOT 3 + x. It is 3 TIMES x.',
    ],
    isActive: true,
  },

  /* 6. Substitution: a² (fill_blank) ────────────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'If a = {{a}}, find a².',
    paramSchema: {
      a: { type: 'int', min: 1, max: 6 },
    },
    answerFormula: 'a * a',
    explanationTemplate:
      'a² means a × a. If a = {{a}}, then a² = {{a}} × {{a}} = {{a*a}}. Squaring means multiplying a number by itself!',
    hints: [
      'a² = a × a (not a × 2!).',
      'Replace a with {{a}}, then multiply {{a}} × {{a}}.',
    ],
    isActive: true,
  },

  /* 7. Substitution: 5y (fill_blank) ────────────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'What is the value of 5y when y = {{a}}?',
    paramSchema: {
      a: { type: 'int', min: 1, max: 10 },
    },
    answerFormula: '5 * a',
    explanationTemplate:
      '5y = 5 × y. If y = {{a}}, then 5y = 5 × {{a}} = {{5*a}}. No wahala — just swap and multiply!',
    hints: [
      '5y means 5 times y.',
      'Replace y with {{a}}, then do 5 × {{a}}.',
    ],
    isActive: true,
  },

  /* 8. Identify like terms (MC) ─────────────────────────────────────────── */
  {
    type: 'multiple_choice',
    difficultyBand: 1,
    templateText: 'Which pair are LIKE TERMS?',
    paramSchema: {},
    answerFormula: '"3x and 2x"',
    explanationTemplate:
      'Like terms have the SAME variable (letter) part. 3x and 2x both have "x", so they are like terms and can be added: 3x + 2x = 5x. Ehen!',
    hints: [
      'Like terms must have the SAME letter part. Coefficients can differ.',
      '3x and 2x → both have x. Like terms!',
      '3x and 3y → different letters (x vs y). NOT like terms.',
    ],
    isActive: true,
  },

  /* 9. Count terms in an expression (fill_blank) ─────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'How many terms does the expression 2x + 3y − 1 have?',
    paramSchema: {},
    answerFormula: '"3"',
    explanationTemplate:
      'Terms are separated by + or − signs. In 2x + 3y − 1 we have: 2x (term 1), 3y (term 2), and −1 (term 3). So there are 3 terms. Let\'s go!',
    hints: [
      'Count the pieces separated by + or − signs.',
      '2x | + | 3y | − | 1 → three separate terms.',
    ],
    isActive: true,
  },

  /* 10. Identify the coefficient (fill_blank) ────────────────────────────── */
  {
    type: 'fill_blank',
    difficultyBand: 1,
    templateText: 'What is the coefficient of x in the expression {{c}}x?',
    paramSchema: {
      c: { type: 'int', min: 2, max: 15 },
    },
    answerFormula: 'c',
    explanationTemplate:
      'The coefficient is the number in front of the variable. In {{c}}x, the number {{c}} is written before x, so {{c}} is the coefficient.',
    hints: [
      'The coefficient is the NUMBER multiplying the variable.',
      'In {{c}}x → {{c}} is in front of x → coefficient = {{c}}.',
      'Oya, just read off the number in front of the letter!',
    ],
    isActive: true,
  },
];
