export interface MetronomeConfig {
	bpm: number;
	accentFirst: boolean;
}

/**
 * Check if a beat is the first beat of a measure.
 */
export function isBeatAccent(beat: number, measureLength = 4): boolean {
	return beat % measureLength === 0;
}

/**
 * Calculate the interval between beats in milliseconds.
 * Throws if bpm is not a positive number.
 */
export function beatIntervalMs(bpm: number): number {
	if (bpm <= 0) {
		throw new Error(`BPM must be positive, got ${bpm}`);
	}
	return 60000 / bpm;
}
