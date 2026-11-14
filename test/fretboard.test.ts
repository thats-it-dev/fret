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

	it("labels first cell as open (fret === null)", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		expect(board[0][0].fret).toBeNull();
	});

	it("numbers frets relative to startFret", () => {
		const board = buildFretboard("C", "majorPentatonic", 3, 5);
		// Cells should represent frets 3,4,5,6,7
		expect(board[0][0].fret).toBe(3);
		expect(board[0][4].fret).toBe(7);
	});

	it("marks inScale correctly for open strings (startFret=0)", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
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
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		// E string (pitch 4) + fret 1 = F (pitch 5) not in scale
		expect(board[0][1].note).toBe("F");
		expect(board[0][1].inScale).toBe(false);
		// E string (pitch 4) + fret 3 = G (pitch 7), IN scale
		expect(board[0][3].note).toBe("G");
		expect(board[0][3].inScale).toBe(true);
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
		// E string (pitch 4): fret 0=E(4,in), 1=F(5,in), 2=F#(6,out), 3=G(7,in), 4=G#(8,out), 5=A(9,in), 6=A#(10,out), 7=B(11,in)
		const eRow = board[0];
		expect(eRow.length).toBe(8);
		expect(eRow[0].inScale).toBe(true);  // E(4)
		expect(eRow[1].inScale).toBe(true);  // F(5)
		expect(eRow[2].inScale).toBe(false); // F#(6)
		expect(eRow[3].inScale).toBe(true);  // G(7)
		expect(eRow[5].inScale).toBe(true);  // A(9)
		expect(eRow[7].inScale).toBe(true);  // B(11)
	});

	it("produces correct note names per string/fret", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 5);
		const eRow = board[0];
		expect(eRow[0].note).toBe("E");
		expect(eRow[1].note).toBe("F");
		expect(eRow[2].note).toBe("F#");
		expect(eRow[3].note).toBe("G");
		expect(eRow[4].note).toBe("G#");
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
		// A minor pentatonic: [0, 3, 5, 7, 10]
		// A string (pitch 9): 9+0=9(A,in), 9+1=10(A#,out), 9+2=11(B,in? no, 3 steps from A is C)
		// Actually: A(9)+0=9(A,in), 9+3=12%12=0(C,in), 9+5=14%12=2(D,in), 9+7=16%12=4(E,in), 9+10=19%12=7(G,in)
		expect(board[1][0].note).toBe("A");
		expect(board[1][0].inScale).toBe(true);
		expect(board[1][3].note).toBe("C");
		expect(board[1][3].inScale).toBe(true);
	});

	describe("finger numbering", () => {
		it("assigns finger 1 to the first fretted in-scale note on a string", () => {
			const board = buildFretboard("C", "minorPentatonic", 0, 5);
			// C minor pentatonic: [0,3,5,7,10] = C,D#,F,G,A
			// E string (row 0, pc=4): fret 0=E(4,out), fret 1=F(5,in), fret 2=F#(6,out)
			expect(board[0][0].finger).toBeUndefined(); // E(4) not in C minor pent
			expect(board[0][1].finger).toBe(1); // F(5) is 1st in-scale fretted note
			expect(board[0][2].finger).toBeUndefined(); // F#(6) out of scale
		});

		it("assigns sequential fingers 1..4 across in-scale notes", () => {
			const board = buildFretboard("C", "major", 0, 8);
			// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
			// E string (pc=4): open E(4,in), F(5,in), F#(6,out), G(7,in), G#(8,out), A(9,in), A#(10,out), B(11,in)
			const row = board[0];
			expect(row[0].finger).toBe(1); // open E is 1st in-scale
			expect(row[1].finger).toBe(2); // F is 2nd
			expect(row[3].finger).toBe(3); // G is 3rd
			expect(row[5].finger).toBe(4); // A is 4th
			expect(row[7].finger).toBe(4); // B is 5th → clamped
		});

		it("wraps at 4: 6th in-scale note also shows 4", () => {
			const board = buildFretboard("C", "major", 0, 13);
			const row = board[0];
			// E string: open E(in), F(1,in), G(3,in), A(5,in), B(7,in), C(12,in)
			// 6 in-scale notes → fingers 1,2,3,4,4,4
			expect(row[0].finger).toBe(1); // open E is 1st in-scale
			expect(row[1].finger).toBe(2); // F is 2nd
			expect(row[3].finger).toBe(3); // G is 3rd
			expect(row[5].finger).toBe(4); // A is 4th
			expect(row[7].finger).toBe(4); // B is 5th → clamped
			expect(row[12].finger).toBe(4); // C is 6th → clamped
		});

		it("open in-scale strings get finger 1", () => {
			const board = buildFretboard("E", "blues", 0, 5);
			// E string (row 0): fret 0=E(4,in, degree "1")
			expect(board[0][0].fret).toBeNull();
			expect(board[0][0].finger).toBe(1); // open E is 1st in-scale
			expect(board[0][0].degree).toBe("1");
		});

		it("per-string independence: each string resets finger counter", () => {
			const board = buildFretboard("C", "major", 0, 8);
			// Row 0 (E string): open E(in), F(in), G(in), A(in), B(in) → fingers 1,2,3,4,4
			expect(board[0][0].finger).toBe(1); // open E is 1st in-scale
			expect(board[0][1].finger).toBe(2);
			expect(board[0][3].finger).toBe(3);
			expect(board[0][5].finger).toBe(4);
			expect(board[0][7].finger).toBe(4); // 5th → wraps
			// Row 5 (high E string, same pc=4): resets
			expect(board[5][0].finger).toBe(1); // open E is 1st
			expect(board[5][1].finger).toBe(2);
			expect(board[5][3].finger).toBe(3);
			expect(board[5][5].finger).toBe(4);
			expect(board[5][7].finger).toBe(4);
		});
	});
});
