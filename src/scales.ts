const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALE_INTERVALS: Record<string, number[]> = {
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  blues: [0, 3, 5, 6, 7, 10],
};

export { NOTE_NAMES };

export const SCALES = Object.keys(SCALE_INTERVALS) as Array<keyof typeof SCALE_INTERVALS>;

export function scalePitchClasses(root: string, scaleId: string): number[] {
  const rootIdx = NOTE_NAMES.indexOf(root);
  if (rootIdx === -1) throw new Error(`Unknown note name: ${root}`);
  const intervals = SCALE_INTERVALS[scaleId];
  if (!intervals) throw new Error(`Unknown scale: ${scaleId}`);
  return intervals.map((i) => (rootIdx + i) % 12);
}

export interface ScaleDefinition {
  name: string;
  intervals: number[];
}

const SCALE_NAMES: Record<string, string> = {
  majorPentatonic: "Major Pentatonic",
  minorPentatonic: "Minor Pentatonic",
  major: "Major",
  naturalMinor: "Natural Minor",
  blues: "Blues",
};

export function scaleById(id: string): ScaleDefinition {
  const intervals = SCALE_INTERVALS[id];
  if (!intervals) throw new Error(`Unknown scale: ${id}`);
  return { name: SCALE_NAMES[id], intervals };
}
