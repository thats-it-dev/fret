import { NOTE_NAMES, scalePitchClasses } from "./scales.js";

// Standard guitar tuning: low E → high E (pitch class indices)
const STRING_PITCH_CLASSES = [4, 9, 2, 7, 11, 4];

const NUM_FRET_SLOTS = 15;

export interface FretCell {
	fret: number | null; // null for open string
	note: string;
	inScale: boolean;
}

/**
 * Build a fretboard grid (6 rows × 15 columns).
 * Row 0 = low E, Row 5 = high E (left-handed: low E on top).
 * Column 0 = open string, Column 14 = fret 14.
 * Nut is on the right edge visually (column 0 is rightmost).
 * @param root - Note name (e.g. "C", "Db")
 * @param scaleId - Scale ID from SCALES
 * @param startFret - Lowest fret that may show inScale (0 = open strings included)
 */
export function buildFretboard(
	root: string,
	scaleId: string,
	startFret: number,
): FretCell[][] {
	const scalePcs = scalePitchClasses(root, scaleId);
	const pcSet = new Set(scalePcs);
	const board: FretCell[][] = [];

	for (let s = 0; s < STRING_PITCH_CLASSES.length; s++) {
		const row: FretCell[] = [];
		const stringPitchClass = STRING_PITCH_CLASSES[s];
		for (let f = 0; f < NUM_FRET_SLOTS; f++) {
			const fretNumber = f === 0 ? null : f;
			const pc = (stringPitchClass + f) % 12;
			const note = NOTE_NAMES[pc];
			const displayFret = f; // 0 = open string
			const inScale = displayFret >= startFret && pcSet.has(pc);
			row.push({ fret: fretNumber, note, inScale });
		}
		board.push(row);
	}

	return board;
}
