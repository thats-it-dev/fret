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
		// E string (pitch 4) → fret 1=F(5,out), fret 3=G(7,in)
		expect(board[0][0].note).toBe("F");
		expect(board[0][0].inScale).toBe(false);
		expect(board[0][2].note).toBe("G");
		expect(board[0][2].inScale).toBe(true);
		// A string (pitch 9) → fret 1=A#(10,out), fret 2=B(11,out), fret 3=C(0,in)
		expect(board[1][1].note).toBe("B");
		expect(board[1][1].inScale).toBe(false);
		expect(board[1][2].note).toBe("C");
		expect(board[1][2].inScale).toBe(true);
	});

	it("marks inScale correctly for fretted notes", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		// E string (pitch 4) + fret 1 = F (pitch 5) not in scale
		expect(board[0][0].note).toBe("F");
		expect(board[0][0].inScale).toBe(false);
		// E string (pitch 4) + fret 3 = G (pitch 7), IN scale
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
		// E string (pitch 4): fret 1=F(5,in), 2=F#(6,out), 3=G(7,in), 4=G#(8,out), 5=A(9,in), 6=A#(10,out), 7=B(11,in)
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
		// frets 1-5: F, F#, G, G#, A
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
		// A string (pc=9): fret 1=A#(10,out), fret 3=C(0,in)
		expect(board[1][0].note).toBe("A#");
		expect(board[1][0].inScale).toBe(false);
		expect(board[1][2].note).toBe("C");
		expect(board[1][2].inScale).toBe(true);
	});

	describe("finger numbering", () => {
		it("assigns finger 1 to the first fretted in-scale note on a string", () => {
			const board = buildFretboard("C", "minorPentatonic", 0, 5);
			// C minor pentatonic: [0,3,5,7,10] = C,D#,F,G,A
			// E string (row 0, pc=4): fret 1=F(5,in), fret 2=F#(6,out)
			expect(board[0][0].finger).toBe(1); // F(5) is 1st fretted in-scale note
			expect(board[0][1].finger).toBeUndefined(); // F#(6) out of scale
		});

		it("assigns sequential fingers 1..4 across fretted in-scale notes", () => {
			const board = buildFretboard("C", "major", 0, 8);
			// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
			// E string (pc=4): E at fret 0 is skipped; fret 1=F(5,in), fret 3=G(7,in),
			//   fret 5=A(9,in), fret 7=B(11,in)
			const row = board[0];
			expect(row[0].finger).toBe(1); // F is 1st fretted in-scale
			expect(row[2].finger).toBe(2); // G is 2nd
			expect(row[4].finger).toBe(3); // A is 3rd
			expect(row[6].finger).toBe(4); // B is 4th
		});

		it("wraps at 4: 6th fretted in-scale note also shows 4", () => {
			const board = buildFretboard("C", "major", 0, 13);
			const row = board[0];
			// E string: E at fret 0 skipped; fret 1=F(in), 3=G(in), 5=A(in), 7=B(in), 12=C(in)
			// 5 fretted in-scale notes → fingers 1,2,3,4,4
			expect(row[0].finger).toBe(1); // F is 1st fretted in-scale
			expect(row[2].finger).toBe(2); // G is 2nd
			expect(row[4].finger).toBe(3); // A is 3rd
			expect(row[6].finger).toBe(4); // B is 4th
			expect(row[11].finger).toBe(4); // C is 5th → clamped
		});

		it("open in-scale strings get no finger number", () => {
			const board = buildFretboard("E", "blues", 0, 5);
			// Open-string column is skipped when startFret=0.
			expect(board[0][0].fret).toBe(1);
			expect(board[0][0].finger).toBeUndefined(); // not in E blues
		});

		it("per-string independence: each string resets finger counter", () => {
			const board = buildFretboard("C", "major", 0, 8);
			// Row 0 (E string): E(fret 0) skipped; F(1,in), G(3,in), A(5,in), B(7,in) → fingers 1,2,3,4
			expect(board[0][0].finger).toBe(1); // F is 1st fretted in-scale
			expect(board[0][2].finger).toBe(2); // G is 2nd
			expect(board[0][4].finger).toBe(3); // A is 3rd
			expect(board[0][6].finger).toBe(4); // B is 4th
			// Row 5 (high E string, same pc=4): resets
			expect(board[5][0].finger).toBe(1); // F is 1st fretted in-scale
			expect(board[5][2].finger).toBe(2); // G is 2nd
			expect(board[5][4].finger).toBe(3); // A is 3rd
			expect(board[5][6].finger).toBe(4); // B is 4th
		});
	});
});
