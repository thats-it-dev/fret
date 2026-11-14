import { NOTE_NAMES, scalePitchClasses, SCALE_DEGREE_LABELS } from "./scales.js";

// Standard guitar tuning: low E → high E (pitch class indices)
const STRING_PITCH_CLASSES = [4, 9, 2, 7, 11, 4];

const MAX_FRET = 14;

export interface FretCell {
	fret: number | null; // null for open string
	note: string;
	inScale: boolean;
	degree?: string; // scale-degree label (e.g. "1", "♭3", "5"); undefined when not in scale
	finger?: number; // 1–4 for in-scale notes per string, starting from the first in-scale note (often the open string at fret 0), left→right
}

/**
 * Build a fretboard grid (6 rows × positionWidth columns).
 * Row 0 = low E, Row 5 = high E (left-handed: low E on top).
 * Column 0 = startFret (open string when startFret=0).
 * Nut is on the right edge visually (column 0 is rightmost).
 * @param root - Note name (e.g. "C", "Db")
 * @param scaleId - Scale ID from SCALES
 * @param startFret - First fret shown (0 = open strings included)
 * @param positionWidth - Number of fret columns to render (capped at MAX_FRET)
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

	const endFret = Math.min(MAX_FRET, startFret + positionWidth - 1);

	for (let s = 0; s < STRING_PITCH_CLASSES.length; s++) {
		const row: FretCell[] = [];
		const stringPitchClass = STRING_PITCH_CLASSES[s];
		for (let f = startFret; f <= endFret; f++) {
			const fretNumber = f === 0 ? null : f;
			const pc = (stringPitchClass + f) % 12;
			const note = NOTE_NAMES[pc];
			const inScale = pcSet.has(pc);
			const degreeIndex = inScale ? scalePcs.indexOf(pc) : -1;
			row.push({ fret: fretNumber, note, inScale, degree: degreeIndex >= 0 ? degreeLabels[degreeIndex] : undefined });
		}
		// Assign finger numbers: in-scale cells get 1–4 left→right (first in-scale note = finger 1)
		let finger = 0;
		for (const cell of row) {
			if (cell.inScale) {
				cell.finger = ++finger > 4 ? 4 : finger;
			}
		}
		board.push(row);
	}

	return board;
}
