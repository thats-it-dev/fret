import { describe, expect, it, beforeEach } from "vitest";
import { getGoalMinutes, setGoalMinutes, getTodayMs, addSessionDuration, formatDuration, getProgressRatio } from "../src/goals.js";

// Stub localStorage for Node environment
const store: Record<string, string> = {};
global.localStorage = {
	getItem: (key: string) => store[key] ?? null,
	setItem: (key: string, value: string) => { store[key] = value; },
	removeItem: (key: string) => { delete store[key]; },
	clear: () => { Object.keys(store).forEach(k => delete store[k]); },
	length: 0,
	key: (n: number) => {
		const keys = Object.keys(store);
		return keys[n] ?? null;
	},
} as unknown as Storage;

describe("getGoalMinutes", () => {
	beforeEach(() => {
		localStorage.removeItem("fret:goal");
	});
	it("returns 20 when no goal is set", () => {
		expect(getGoalMinutes()).toBe(20);
	});
	it("returns the stored value", () => {
		localStorage.setItem("fret:goal", "30");
		expect(getGoalMinutes()).toBe(30);
	});
	it("returns 20 for an empty string", () => {
		localStorage.setItem("fret:goal", "");
		expect(getGoalMinutes()).toBe(20);
	});
	it("throws on negative value via setGoalMinutes", () => {
		expect(() => setGoalMinutes(-1)).toThrow(/non-negative/);
	});
	it("throws on NaN", () => {
		expect(() => setGoalMinutes(NaN)).toThrow(/non-negative/);
	});
	it("throws on Infinity", () => {
		expect(() => setGoalMinutes(Infinity)).toThrow(/non-negative/);
	});
	it("accepts 0", () => {
		setGoalMinutes(0);
		expect(getGoalMinutes()).toBe(0);
	});
});

describe("getTodayMs / addSessionDuration", () => {
	beforeEach(() => {
		localStorage.removeItem("fret:today");
	});
	it("returns 0 when no sessions", () => {
		expect(getTodayMs()).toBe(0);
	});
	it("adds to today's total", () => {
		addSessionDuration(5000);
		expect(getTodayMs()).toBe(5000);
		addSessionDuration(3000);
		expect(getTodayMs()).toBe(8000);
	});
	it("resets on a new day (changes date in stored JSON)", () => {
		addSessionDuration(5000);
		// Corrupt the date to simulate a new day
		localStorage.setItem("fret:today", JSON.stringify({ date: "1970-01-01", totalMs: 99999 }));
		expect(getTodayMs()).toBe(0);
	});
});

describe("formatDuration", () => {
	it("formats 0 as 0s", () => {
		expect(formatDuration(0)).toBe("0s");
	});
	it("formats 90000 as 1m 30s", () => {
		expect(formatDuration(90000)).toBe("1m 30s");
	});
	it("formats 3661000 as 1h 1m", () => {
		expect(formatDuration(3661000)).toBe("1h 1m");
	});
	it("formats 120000 as 2m", () => {
		expect(formatDuration(120000)).toBe("2m");
	});
	it("throws on negative", () => {
		expect(() => formatDuration(-100)).toThrow(/negative/);
	});
});

describe("getProgressRatio", () => {
	beforeEach(() => {
		localStorage.removeItem("fret:today");
		localStorage.removeItem("fret:goal");
	});
	it("returns 0 when no goal set", () => {
		expect(getProgressRatio()).toBe(0);
	});
	it("returns 0.5 for half a 20-min goal", () => {
		setGoalMinutes(20);
		addSessionDuration(600_000); // 10 min
		expect(getProgressRatio()).toBe(0.5);
	});
	it("caps at 1", () => {
		setGoalMinutes(20);
		addSessionDuration(1_800_001); // >30 min
		expect(getProgressRatio()).toBe(1);
	});
	it("returns 0 when goal is 0", () => {
		setGoalMinutes(0);
		addSessionDuration(120_000); // 2 min
		expect(getProgressRatio()).toBe(0);
	});
});
