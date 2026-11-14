import { describe, expect, it } from "vitest";
import {
	NOTE_NAMES,
	SCALES,
	scalePitchClasses,
	scaleById,
} from "../src/scales.js";

describe("NOTE_NAMES", () => {
	it("returns 12 note names in order", () => {
		expect(NOTE_NAMES).toHaveLength(12);
		expect(NOTE_NAMES[0]).toBe("C");
		expect(NOTE_NAMES[6]).toBe("F#");
	});
});

describe("SCALES", () => {
	it("contains all five scale IDs", () => {
		expect(SCALES).toContain("majorPentatonic");
		expect(SCALES).toContain("minorPentatonic");
		expect(SCALES).toContain("major");
		expect(SCALES).toContain("naturalMinor");
		expect(SCALES).toContain("blues");
	});
});

describe("scalePitchClasses", () => {
	it("returns correct pitch classes for C major pentatonic", () => {
		expect(scalePitchClasses("C", "majorPentatonic")).toEqual([0, 2, 4, 7, 9]);
	});

	it("returns correct pitch classes for A minor pentatonic (A=9)", () => {
		// 9+0=9, 9+3=0, 9+5=2, 9+7=4, 9+10=7
		expect(scalePitchClasses("A", "minorPentatonic")).toEqual([9, 0, 2, 4, 7]);
	});

	it("returns correct pitch classes for C major", () => {
		expect(scalePitchClasses("C", "major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
	});

	it("returns correct pitch classes for A natural minor (A=9)", () => {
		// 9+0=9, 9+2=11, 9+3=0, 9+5=2, 9+7=4, 9+8=5, 9+10=7
		expect(scalePitchClasses("A", "naturalMinor")).toEqual([9, 11, 0, 2, 4, 5, 7]);
	});

	it("returns correct pitch classes for E blues (E=4)", () => {
		// 4+0=4, 4+3=7, 4+5=9, 4+6=10, 4+7=11, 4+10=2
		expect(scalePitchClasses("E", "blues")).toEqual([4, 7, 9, 10, 11, 2]);
	});

	it("handles root B correctly", () => {
		// B major: B(11), C#(1), D#(3), E(4), G(6), A(8), Bb(10)
		expect(scalePitchClasses("B", "major")).toEqual([11, 1, 3, 4, 6, 8, 10]);
	});

	it("handles sharp roots", () => {
		expect(scalePitchClasses("C#", "majorPentatonic")).toEqual([1, 3, 5, 8, 10]);
		expect(scalePitchClasses("D#", "majorPentatonic")).toEqual([3, 5, 7, 10, 0]);
	});

	it("throws on invalid scale ID", () => {
		expect(() => scalePitchClasses("C", "invalid")).toThrow(/scale/);
	});

	it("throws on invalid note name", () => {
		expect(() => scalePitchClasses("X", "majorPentatonic")).toThrow(/note/);
	});
});

describe("scaleById", () => {
	it("returns the scale definition", () => {
		const scale = scaleById("majorPentatonic");
		expect(scale).toEqual({
			name: "Major Pentatonic",
			intervals: [0, 2, 4, 7, 9],
		});
	});

	it("returns correct intervals for each scale", () => {
		expect(scaleById("majorPentatonic").intervals).toEqual([0, 2, 4, 7, 9]);
		expect(scaleById("minorPentatonic").intervals).toEqual([0, 3, 5, 7, 10]);
		expect(scaleById("major").intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
		expect(scaleById("naturalMinor").intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
		expect(scaleById("blues").intervals).toEqual([0, 3, 5, 6, 7, 10]);
	});

	it("throws on invalid ID", () => {
		expect(() => scaleById("invalid")).toThrow(/scale/);
	});
});
