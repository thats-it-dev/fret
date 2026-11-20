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

export interface ScheduleState {
	nextBeatTimeSec: number;
	nextBeatIndex: number;
}

export interface BeatEvent {
	timeSec: number;
	beat: number;
	accent: boolean;
}

/**
 * Decide which beats fall inside [nowSec, nowSec + lookaheadSec] and return the
 * next scheduler state. Web Audio times are seconds, so the interval comes from
 * beatIntervalMs converted; after a pause the state resyncs to now instead of
 * firing a burst of late beats.
 */
export function scheduleBeats(
	state: ScheduleState,
	nowSec: number,
	bpm: number,
	lookaheadSec = 0.1,
): { events: BeatEvent[]; state: ScheduleState } {
	const intervalSec = beatIntervalMs(bpm) / 1000;
	let { nextBeatTimeSec, nextBeatIndex } = state;
	if (nextBeatTimeSec < nowSec) {
		const missed = Math.ceil((nowSec - nextBeatTimeSec) / intervalSec);
		nextBeatTimeSec += missed * intervalSec;
		nextBeatIndex += missed;
	}
	const events: BeatEvent[] = [];
	while (nextBeatTimeSec <= nowSec + lookaheadSec) {
		events.push({ timeSec: nextBeatTimeSec, beat: nextBeatIndex, accent: isBeatAccent(nextBeatIndex) });
		nextBeatTimeSec += intervalSec;
		nextBeatIndex += 1;
	}
	return { events, state: { nextBeatTimeSec, nextBeatIndex } };
}

/** Common practice tempos; the metronome rail snaps between these values. */
export const COMMON_BPM = [40, 60, 72, 80, 90, 100, 120, 140, 160, 180];

/** The common tempo closest to bpm; ties pick the slower tempo. */
export function nearestCommonBpm(bpm: number): number {
	return COMMON_BPM.reduce(
		(best, c) => (Math.abs(c - bpm) < Math.abs(best - bpm) ? c : best),
		COMMON_BPM[0],
	);
}

/** Index whose center is nearest to target; -1 for an empty list. */
export function nearestIndex(centers: number[], target: number): number {
	if (centers.length === 0) return -1;
	let best = 0;
	for (let i = 1; i < centers.length; i++) {
		if (Math.abs(centers[i] - target) < Math.abs(centers[best] - target)) best = i;
	}
	return best;
}
