export interface CurriculumRow { grade: number; cells: Record<string, string> }
/** Each non-empty cell is one skill cluster. Keeps the `skills` claim honest. */
export const countSkills = (rows: CurriculumRow[]) =>
  rows.reduce((n, r) => n + Object.values(r.cells).filter((c) => c.trim() !== '').length, 0);
