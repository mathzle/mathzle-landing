export interface Problem {
  a: number;
  b: number;
  op: '+' | '−';
  answer: number;
  choices: readonly number[];
}

/** Grade 1–2 warm-ups. Hints live in i18n `try.hints`, same order. */
export const PROBLEMS: readonly Problem[] = [
  { a: 7, b: 5, op: '+', answer: 12, choices: [11, 12, 13] },
  { a: 15, b: 8, op: '−', answer: 7, choices: [6, 7, 9] },
  { a: 9, b: 6, op: '+', answer: 15, choices: [14, 15, 16] },
];

export const isCorrect = (p: Problem, choice: number) => choice === p.answer;
export const nextIndex = (i: number, len = PROBLEMS.length) => (i + 1) % len;
