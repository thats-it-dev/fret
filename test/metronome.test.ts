import { describe, expect, it } from "vitest";
import { beatIntervalMs, isBeatAccent, scheduleBeats } from "../src/metronome.js";

describe("beatIntervalMs", () => {
	it("returns 600 for 100bpm", () => {
		expect(beatIntervalMs(100)).toBe(600);
	});
	it("returns 1000 for 60bpm", () => {
		expect(beatIntervalMs(60)).toBe(1000);
	});
	it("returns 300 for 200bpm", () => {
		expect(beatIntervalMs(200)).toBe(300);
	});
	it("throws on zero bpm", () => {
		expect(() => beatIntervalMs(0)).toThrow(/bpm/i);
	});
	it("throws on negative bpm", () => {
		expect(() => beatIntervalMs(-60)).toThrow(/bpm/i);
	});
	it("throws on negative bpm", () => {
		expect(() => beatIntervalMs(-1)).toThrow(/bpm/i);
	});
});

describe("isBeatAccent", () => {
	it("returns true for beat 0", () => {
		expect(isBeatAccent(0)).toBe(true);
	});
	it("returns false for beats 1-3 in 4/4", () => {
		expect(isBeatAccent(1)).toBe(false);
		expect(isBeatAccent(2)).toBe(false);
		expect(isBeatAccent(3)).toBe(false);
	});
	it("returns true for beat 4 (next bar)", () => {
		expect(isBeatAccent(4)).toBe(true);
	});
	it("works with different measure lengths", () => {
		expect(isBeatAccent(0, 3)).toBe(true);
		expect(isBeatAccent(3, 3)).toBe(true);
		expect(isBeatAccent(1, 3)).toBe(false);
		expect(isBeatAccent(2, 3)).toBe(false);
	});
});

describe("scheduleBeats", () => {
	it("schedules at beat-interval seconds, not milliseconds", () => {
		const r = scheduleBeats({ nextBeatTimeSec: 0, nextBeatIndex: 0 }, -0.1, 120, 1.1);
		expect(r.events.map((e) => e.timeSec)).toEqual([0, 0.5, 1]);
		expect(r.events.map((e) => e.accent)).toEqual([true, false, false]);
		expect(r.state.nextBeatTimeSec).toBeCloseTo(1.5, 6);
	});
	it("advances the beat index across bars", () => {
		const r = scheduleBeats({ nextBeatTimeSec: 1.0, nextBeatIndex: 2 }, 1.0, 60, 2.0);
		expect(r.events.map((e) => e.beat)).toEqual([2, 3, 4]);
		expect(r.events.map((e) => e.accent)).toEqual([false, false, true]);
	});
	it("does not burst after a long pause", () => {
		const r = scheduleBeats({ nextBeatTimeSec: 0.5, nextBeatIndex: 1 }, 100, 120, 0.1);
		expect(r.events.length).toBeLessThanOrEqual(1);
		expect(r.state.nextBeatTimeSec).toBeGreaterThanOrEqual(100);
	});
	it("schedules the first beat without skipping it", () => {
		const r = scheduleBeats({ nextBeatTimeSec: 0.1, nextBeatIndex: 0 }, 0, 60, 0.1);
		expect(r.events.length).toBe(1);
	});
	it("keeps exact spacing at varied bpm streamed over time", () => {
		for (const bpm of [40, 72, 90, 180]) {
			let state = { nextBeatTimeSec: 0, nextBeatIndex: 0 };
			const times: number[] = [];
			for (let now = 0; now < 4; now += 0.5) {
				const r = scheduleBeats(state, now, bpm, 0.5);
				times.push(...r.events.map((e) => e.timeSec));
				state = r.state;
			}
			expect(times.length).toBeGreaterThan(1);
			for (let i = 1; i < times.length; i++) {
				expect(times[i] - times[i - 1]).toBeCloseTo(60 / bpm, 6);
			}
		}
	});
});
