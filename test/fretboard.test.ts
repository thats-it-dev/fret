import { describe, expect, it } from "vitest";
import { buildFretboard } from "../src/fretboard.js";

describe("buildFretboard", () => {
	const openStringPitchClasses = [4, 9, 2, 7, 11, 4]; // E A D G B E
	const fretsPerRow = 15;
	const numStrings = 6;

	it("returns 6 rows of 15 cells each", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		expect(board).toHaveLength(numStrings);
		for (const row of board) {
			expect(row).toHaveLength(fretsPerRow);
		}
	});

	it("labels fret 0 as open (fret === null or undefined)", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		expect(board[0][0].fret).toBeNull();
	});

	it("numbers frets 1..14 correctly", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		expect(board[0][1].fret).toBe(1);
		expect(board[5][14].fret).toBe(14);
	});

	it("marks inScale correctly for open strings (startFret=0)", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		// C major pentatonic: [0, 2, 4, 7, 9]
		// E string (pitch 4) → fret 0 is E (pitch 4, in scale)
		expect(board[0][0].note).toBe("E");
		expect(board[0][0].inScale).toBe(true);
		// A string (pitch 9) → fret 0 is A (pitch 9, in scale)
		expect(board[1][0].note).toBe("A");
		expect(board[1][0].inScale).toBe(true);
		// D string (pitch 2) → fret 0 is D (pitch 2, in scale)
		expect(board[2][0].note).toBe("D");
		expect(board[2][0].inScale).toBe(true);
		// G string (pitch 7) → fret 0 is G (pitch 7, in scale)
		expect(board[3][0].note).toBe("G");
		expect(board[3][0].inScale).toBe(true);
		// B string (pitch 11) → fret 0 is B (pitch 11, NOT in major pentatonic)
		expect(board[4][0].note).toBe("B");
		expect(board[4][0].inScale).toBe(false);
		// E string (pitch 4) → fret 0 is E
		expect(board[5][0].note).toBe("E");
		expect(board[5][0].inScale).toBe(true);
	});

	it("marks inScale correctly for fretted notes", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		// E string (pitch 4) + fret 2 = F# (pitch 6) not in scale
		expect(board[0][2].note).toBe("F#");
		expect(board[0][2].inScale).toBe(false);
		// E string (pitch 4) + fret 4 = G# (pitch 8) not in scale
		expect(board[0][4].note).toBe("G#");
		expect(board[0][4].inScale).toBe(false);
		// E string (pitch 4) + fret 7 = B (pitch 11) not in scale
		expect(board[0][7].note).toBe("B");
		expect(board[0][7].inScale).toBe(false);
		// E string (pitch 4) + fret 9 = C# (pitch 1) not in scale
		expect(board[0][9].note).toBe("C#");
		expect(board[0][9].inScale).toBe(false);
	});

	it("marks inScale=false for frets below startFret", () => {
		const board = buildFretboard("C", "majorPentatonic", 5);
		// Frets 0..4 should have inScale=false regardless of pitch class
		for (let s = 0; s < numStrings; s++) {
			for (let f = 0; f < 5; f++) {
				expect(board[s][f].inScale).toBe(false);
			}
		}
		// Fret 5+ should respect pitch class
		const eString = board[0];
		// fret 5 = A (pitch 9), in major pentatonic [0,2,4,7,9]
		expect(eString[5].inScale).toBe(true);
		// fret 7 = B (pitch 11), NOT in C major pentatonic [0,2,4,7,9]
		expect(eString[7].inScale).toBe(false);
	});

	it("handles root C on all strings", () => {
		const board = buildFretboard("C", "major", 0);
		const cPcs = [0, 2, 4, 5, 7, 9, 11];
		// E string (pitch 4): fret 0=E(4,in), 1=F(5,in), 2=F#(6,out), 3=G(7,in), 4=G#(8,out), 5=A(9,in), 6=A#(10,out), 7=B(11,in), 8=C(0,in), 9=C#(1,out), 10=D(2,in), 11=D#(3,out), 12=E(4,in), 13=F(5,in), 14=F#(6,out)
		const eRow = board[0];
		expect(eRow[0].inScale).toBe(true);  // E(4)
		expect(eRow[1].inScale).toBe(true);  // F(5)
		expect(eRow[2].inScale).toBe(false); // F#(6)
		expect(eRow[3].inScale).toBe(true);  // G(7)
		expect(eRow[8].inScale).toBe(true);  // C(0)
		expect(eRow[12].inScale).toBe(true); // E(4)
	});

	it("produces correct note names per string/fret", () => {
		const board = buildFretboard("C", "majorPentatonic", 0);
		// E string: E(4), F(5), F#(6), G(7), G#(8), A(9), A#(10), B(11), C(0), C#(1), D(2), D#(3), E(4), F(5), F#(6)
		const eRow = board[0];
		expect(eRow[0].note).toBe("E");
		expect(eRow[1].note).toBe("F");
		expect(eRow[5].note).toBe("A");
		expect(eRow[8].note).toBe("C");
		expect(eRow[12].note).toBe("E");
	});

	it("handles startFret at the top of the board", () => {
		const board = buildFretboard("C", "majorPentatonic", 14);
		// Only fret 14+ should have inScale checked; fret 14 = C# on E string (pitch 4+14=18%12=6=F#, not in scale)
		expect(board[0][14].inScale).toBe(false);
		// All frets below should be false
		for (let f = 0; f < 14; f++) {
			expect(board[0][f].inScale).toBe(false);
		}
	});

	it("handles A minor pentatonic (A=9)", () => {
		const board = buildFretboard("A", "minorPentatonic", 0);
		// A minor pentatonic: [0, 3, 5, 7, 10]
		// A string (pitch 9): 9+0=9(A,in), 9+1=10(A#,out), 9+2=11(B,in? no, 3 steps from A is C)
		// Actually: A(9)+0=9(A,in), 9+3=12%12=0(C,in), 9+5=14%12=2(D,in), 9+7=16%12=4(E,in), 9+10=19%12=7(G,in)
		expect(board[1][0].note).toBe("A");
		expect(board[1][0].inScale).toBe(true);
		expect(board[1][3].note).toBe("C");
		expect(board[1][3].inScale).toBe(true);
	});
});
