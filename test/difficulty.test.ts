import { describe, expect, it } from "vitest";
import { DIFFICULTY_LEVELS, getDifficultyLevel, DifficultyLevel } from "../src/difficulty.js";

describe("DIFFICULTY_LEVELS", () => {
	it("has 6 levels", () => {
		expect(DIFFICULTY_LEVELS).toHaveLength(6);
	});

	it("has correct level numbers", () => {
		expect(DIFFICULTY_LEVELS.map((d) => d.level)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it("has increasing BPMs", () => {
		for (let i = 1; i < DIFFICULTY_LEVELS.length; i++) {
			expect(DIFFICULTY_LEVELS[i].bpm).toBeGreaterThan(DIFFICULTY_LEVELS[i - 1].bpm);
		}
	});

	it("has positionWidth 5-8 across levels", () => {
		const widths = DIFFICULTY_LEVELS.map((d) => d.positionWidth);
		expect(widths).toEqual([5, 6, 6, 7, 7, 8]);
	});

	it("has non-empty names", () => {
		for (const level of DIFFICULTY_LEVELS) {
			expect(level.name.length).toBeGreaterThan(0);
		}
	});
});

describe("getDifficultyLevel", () => {
	it("returns the correct level for valid input", () => {
		expect(getDifficultyLevel(1)).toEqual({ level: 1, name: "Beginner", bpm: 60, positionWidth: 5 });
		expect(getDifficultyLevel(6)).toEqual({ level: 6, name: "Expert", bpm: 120, positionWidth: 8 });
	});

	it("throws on invalid level", () => {
		expect(() => getDifficultyLevel(0)).toThrow(/level/);
		expect(() => getDifficultyLevel(7)).toThrow(/level/);
		expect(() => getDifficultyLevel(-1)).toThrow(/level/);
	});
});
