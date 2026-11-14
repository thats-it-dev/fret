export interface DifficultyLevel {
  level: number;
  name: string;
  bpm: number;
  positionWidth: number;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, name: "Beginner", bpm: 60, positionWidth: 5 },
  { level: 2, name: "Easy", bpm: 72, positionWidth: 6 },
  { level: 3, name: "Moderate", bpm: 84, positionWidth: 6 },
  { level: 4, name: "Intermediate", bpm: 96, positionWidth: 7 },
  { level: 5, name: "Hard", bpm: 110, positionWidth: 7 },
  { level: 6, name: "Expert", bpm: 120, positionWidth: 8 },
];

export function getDifficultyLevel(level: number): DifficultyLevel {
  const found = DIFFICULTY_LEVELS.find((d) => d.level === level);
  if (!found) throw new Error(`Unknown difficulty level: ${level}`);
  return found;
}
