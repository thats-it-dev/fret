import { NOTE_NAMES, scalePitchClasses, SCALE_DEGREE_LABELS } from "./scales.js";

// Standard guitar tuning: low E → high E (pitch class indices)
const STRING_PITCH_CLASSES = [4, 9, 2, 7, 11, 4];

const MAX_FRET = 14;

export interface FretCell {
	fret: number;
	note: string;
	inScale: boolean;
	degree?: string; // scale-degree label (e.g. "1", "♭3", "5"); undefined when not in scale

}

/**
 * Build a fretboard grid (6 rows × positionWidth columns).
 * Row 0 = high E (1st), Row 5 = low E (6th).
 * When startFret=0 the open-string column is skipped (board shows frets 1..positionWidth).
 * Nut is on the right edge visually (column 0 is rightmost).
 * @param root - Note name (e.g. "C", "Db")
 * @param scaleId - Scale ID from SCALES
 * @param startFret - First fret shown (0 = open strings, rendered as frets 1..positionWidth)
 * @param positionWidth - Number of columns to render (capped at MAX_FRET)
 */
export function buildFretboard(
	root: string,
	scaleId: string,
	startFret: number,
	positionWidth: number,
): FretCell[][] {
	const scalePcs = scalePitchClasses(root, scaleId);
	const pcSet = new Set(scalePcs);
	const degreeLabels = SCALE_DEGREE_LABELS[scaleId] ?? [];
	const board: FretCell[][] = [];

	// When startFret=0 skip the open column; board shows frets 1..positionWidth.
	const effectiveEnd = startFret === 0 ? Math.min(MAX_FRET, positionWidth) : Math.min(MAX_FRET, startFret + positionWidth - 1);

	for (let s = STRING_PITCH_CLASSES.length - 1; s >= 0; s--) {
		const row: FretCell[] = [];
		const stringPitchClass = STRING_PITCH_CLASSES[s];
		for (let f = startFret === 0 ? 1 : startFret; f <= effectiveEnd; f++) {
			const pc = (stringPitchClass + f) % 12;
			const note = NOTE_NAMES[pc];
			const inScale = pcSet.has(pc);
			const degreeIndex = inScale ? scalePcs.indexOf(pc) : -1;
			row.push({ fret: f, note, inScale, degree: degreeIndex >= 0 ? degreeLabels[degreeIndex] : undefined });
		}
		board.push(row);
	}

	return board;
}
