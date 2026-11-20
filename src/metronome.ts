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
