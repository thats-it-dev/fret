import { describe, expect, it } from "vitest";
import { beatIntervalMs, isBeatAccent } from "../src/metronome.js";

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
