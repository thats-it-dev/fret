import { describe, expect, it } from "vitest";
import { buildFretboard } from "../src/fretboard.js";

describe("buildFretboard", () => {
	const openStringPitchClasses = [4, 9, 2, 7, 11, 4]; // E A D G B E
	const numStrings = 6;

	it("returns 6 rows with positionWidth columns", () => {
		const positionWidth = 5;
		const board = buildFretboard("C", "majorPentatonic", 0, positionWidth);
		expect(board).toHaveLength(numStrings);
		for (const row of board) {
			expect(row).toHaveLength(positionWidth);
		}
	});

	it("labels cells with fret numbers when startFret=0", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		// Open-string column is skipped; first column is fret 1.
		expect(board[0][0].fret).toBe(1);
		expect(board[0][3].fret).toBe(4);
	});

	it("numbers frets relative to startFret", () => {
		const board = buildFretboard("C", "majorPentatonic", 3, 5);
		// Cells should represent frets 3,4,5,6,7
		expect(board[0][0].fret).toBe(3);
		expect(board[0][4].fret).toBe(7);
	});

	it("marks inScale correctly for fretted notes (startFret=0)", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		// C major pentatonic: [0, 2, 4, 7, 9]
		// High E string (pc 4) → fret 1=F(5,out), fret 3=G(7,in)
		expect(board[0][0].note).toBe("F");
		expect(board[0][0].inScale).toBe(false);
		expect(board[0][2].note).toBe("G");
		expect(board[0][2].inScale).toBe(true);
		// A string (pc 9, now row 4) → fret 1=A#(10,out), fret 2=B(11,out), fret 3=C(0,in)
		expect(board[4][1].note).toBe("B");
		expect(board[4][1].inScale).toBe(false);
		expect(board[4][2].note).toBe("C");
		expect(board[4][2].inScale).toBe(true);
	});

	it("marks inScale correctly for fretted notes", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		// High E string (pc 4) + fret 1 = F (pc 5) not in scale
		expect(board[0][0].note).toBe("F");
		expect(board[0][0].inScale).toBe(false);
		// High E string (pc 4) + fret 3 = G (pc 7), IN scale
		expect(board[0][2].note).toBe("G");
		expect(board[0][2].inScale).toBe(true);
	});

	it("marks inScale for fretted notes in window", () => {
		const board = buildFretboard("C", "majorPentatonic", 5, 8);
		// Frets shown: 5,6,7,8,9,10,11,12
		// Fret 5 = A (pitch 9), in major pentatonic [0,2,4,7,9]
		expect(board[0][0].inScale).toBe(true);
		// Fret 7 = B (pitch 11), NOT in C major pentatonic
		expect(board[0][2].inScale).toBe(false);
		// Fret 8 = C (pitch 0), IN scale
		expect(board[0][3].inScale).toBe(true);
	});

	it("handles root C on all strings in window", () => {
		const board = buildFretboard("C", "major", 0, 8);
		// High E string (pc 4): fret 1=F(5,in), 2=F#(6,out), 3=G(7,in), 4=G#(8,out), 5=A(9,in), 6=A#(10,out), 7=B(11,in)
		const eRow = board[0];
		expect(eRow.length).toBe(8); // frets 1-8 (positionWidth=8, skip open)
		expect(eRow[0].inScale).toBe(true);  // F(5)
		expect(eRow[1].inScale).toBe(false); // F#(6)
		expect(eRow[2].inScale).toBe(true);  // G(7)
		expect(eRow[4].inScale).toBe(true);  // A(9)
		expect(eRow[6].inScale).toBe(true);  // B(11)
	});

	it("produces correct note names per string/fret", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		const eRow = board[0];
		// High E frets 1-5: F, F#, G, G#, A
		expect(eRow[0].note).toBe("F");
		expect(eRow[1].note).toBe("F#");
		expect(eRow[2].note).toBe("G");
		expect(eRow[3].note).toBe("G#");
		expect(eRow[4].note).toBe("A");
	});

	it("handles startFret=12 (near board end)", () => {
		const board = buildFretboard("C", "majorPentatonic", 12, 4);
		expect(board[0]).toHaveLength(3); // clipped at fret 14
		// Frets 12,13,14
		expect(board[0][0].fret).toBe(12);
		expect(board[0][1].fret).toBe(13);
		expect(board[0][2].fret).toBe(14);
	});

	it("handles A minor pentatonic (A=9)", () => {
		const board = buildFretboard("A", "minorPentatonic", 0, 5);
		// A minor pentatonic pitch classes: {9(A), 0(C), 2(D), 4(E), 7(G)}
		// A string (pc=9, row 4): fret 1=A#(10,out), fret 3=C(0,in)
		expect(board[4][0].note).toBe("A#");
		expect(board[4][0].inScale).toBe(false);
		expect(board[4][2].note).toBe("C");
		expect(board[4][2].inScale).toBe(true);
	});

	describe("board row order — flipped: row 0 = high E (1st), row 5 = low E (6th)", () => {
		it("row 0 = high E (pc 4) → first note at fret 1 is F", () => {
			const board = buildFretboard("C", "majorPentatonic", 0, 5);
			expect(board[0][0].note).toBe("F"); // E + 1 = F
			expect(board[0][1].note).toBe("F#");
		});

		it("row 5 = low E (pc 4) → same notes as row 0 (both pc 4)", () => {
			const board = buildFretboard("C", "majorPentatonic", 0, 5);
			expect(board[5][0].note).toBe("F");
			expect(board[5][0].note).toBe(board[0][0].note); // both E strings, pc=4
		});

		it("A string is now at row 4", () => {
			const board = buildFretboard("C", "minorPentatonic", 0, 5);
			// A string (pc=9): fret 1 = A#(10)
			expect(board[4][0].note).toBe("A#");
		});


	});
});
