import { describe, expect, it } from "vitest";
import { buildFretboard } from "../src/fretboard.js";

describe("buildFretboard — degree field", () => {
	it("C major: C=1, D=2, E=3, F=4, G=5, A=6, B=7", () => {
		const board = buildFretboard("C", "major", 0, 2);
		const cells = board[0]; // high E string (row 0, pc=4): fret 1=F(5), fret 2=F#(6)
		// at fret 1 (F): note F, in C major → degree 4
		expect(cells[0]?.degree).toBe("4");
		// at fret 2 (F#): not in C major → null
		expect(cells[1]?.degree).toBeUndefined();
	});

	it("C major: all 7 degrees at first position", () => {
		const board = buildFretboard("C", "major", 0, 8);
		// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
		// Row 0 = high E (pc 4): F(1→d4), F#(2→x), G(3→d5), G#(4→x), A(5→d6), A#(6→x), B(7→d7), C(8→d1)
		expect(board[0][0].degree).toBe("4"); // F
		expect(board[0][1].degree).toBeUndefined(); // F#
		expect(board[0][2].degree).toBe("5"); // G
		expect(board[0][3].degree).toBeUndefined(); // G#
		expect(board[0][4].degree).toBe("6"); // A
		expect(board[0][5].degree).toBeUndefined(); // A#
		expect(board[0][6].degree).toBe("7"); // B
		expect(board[0][7].degree).toBe("1"); // C
		// Row 1 = B (pc 11): C(1→d1), C#(2→x), D(3→d2), D#(4→x), E(5→d3), F(6→d4), F#(7→x), G(8→d5)
		expect(board[1][0].degree).toBe("1"); // C
		expect(board[1][1].degree).toBeUndefined(); // C#
		expect(board[1][2].degree).toBe("2"); // D
		expect(board[1][3].degree).toBeUndefined(); // D#
		expect(board[1][4].degree).toBe("3"); // E
		expect(board[1][5].degree).toBe("4"); // F
		expect(board[1][6].degree).toBeUndefined(); // F#
		expect(board[1][7].degree).toBe("5"); // G
		// Row 2 = G (pc 7): A#(1→x), A(2→d6), Bb(3→x), B(4→d7), C(5→d1), C#(6→x), D(7→d2), D#(8→x)
		expect(board[2][0].degree).toBeUndefined(); // A#
		expect(board[2][1].degree).toBe("6"); // A
		expect(board[2][2].degree).toBeUndefined(); // Bb
		expect(board[2][3].degree).toBe("7"); // B
		expect(board[2][4].degree).toBe("1"); // C
		expect(board[2][5].degree).toBeUndefined(); // C#
		expect(board[2][6].degree).toBe("2"); // D
		expect(board[2][7].degree).toBeUndefined(); // D#
		// Row 3 = D (pc 2): D#(1→x), E(2→d3), F(3→d4), F#(4→x), G(5→d5), G#(6→x), A(7→d6), A#(8→x)
		expect(board[3][0].degree).toBeUndefined(); // D#
		expect(board[3][1].degree).toBe("3"); // E
		expect(board[3][2].degree).toBe("4"); // F
		expect(board[3][3].degree).toBeUndefined(); // F#
		expect(board[3][4].degree).toBe("5"); // G
		expect(board[3][5].degree).toBeUndefined(); // G#
		expect(board[3][6].degree).toBe("6"); // A
		expect(board[3][7].degree).toBeUndefined(); // A#
		// Row 4 = A (pc 9): Bb(1→x), B(2→d7), C(3→d1), C#(4→x), D(5→d2), Eb(6→x), E(7→d3), F(8→d4)
		expect(board[4][0].degree).toBeUndefined(); // Bb
		expect(board[4][1].degree).toBe("7"); // B
		expect(board[4][2].degree).toBe("1"); // C
		expect(board[4][3].degree).toBeUndefined(); // C#
		expect(board[4][4].degree).toBe("2"); // D
		expect(board[4][5].degree).toBeUndefined(); // Eb
		expect(board[4][6].degree).toBe("3"); // E
		expect(board[4][7].degree).toBe("4"); // F
		// Row 5 = low E (pc 4): same as row 0
		expect(board[5][0].degree).toBe("4"); // F
		expect(board[5][1].degree).toBeUndefined(); // F#
		expect(board[5][2].degree).toBe("5"); // G
		expect(board[5][3].degree).toBeUndefined(); // G#
		expect(board[5][4].degree).toBe("6"); // A
		expect(board[5][5].degree).toBeUndefined(); // A#
		expect(board[5][6].degree).toBe("7"); // B
		expect(board[5][7].degree).toBe("1"); // C
	});

	it("C major pentatonic: degrees 1,2,3,5,6", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 8);
		// C major pentatonic: C(0), D(2), E(4), G(7), A(9)
		// Low E string (row 5, pc=4): F(1,out), F#(2,out), G(3,in=5), G#(4,out), A(5,in=6), A#(6,out), B(7,out), C(8,in=1)
		expect(board[5][0].degree).toBeUndefined(); // F out
		expect(board[5][2].degree).toBe("5"); // G
		expect(board[5][4].degree).toBe("6"); // A
	});

	it("A natural minor: root=A highlighted as degree 1", () => {
		const board = buildFretboard("A", "naturalMinor", 0, 5);
		// A natural minor: A(9), B(11), C(0), D(2), E(4), F(5), G(7)
		// High E string (row 0, pc=4): F(1,in=♭6), F#(2,out), G(3,in=5), G#(4,out)
		expect(board[0][0].degree).toBe("♭6"); // F
		expect(board[0][1].degree).toBeUndefined(); // F#
		expect(board[0][2].degree).toBe("♭7"); // G is ♭7 in A natural minor
	});

	it("C natural minor: C=1 at root", () => {
		const board = buildFretboard("C", "naturalMinor", 3, 1);
		// C natural minor: C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
		// Low E string (row 5, pc=4): E at fret 3 = G(7) → degree 5
		expect(board[5][0].degree).toBe("5");
	});

	it("C blues: degrees 1,♭3,4,5,♭5,♭7", () => {
		const board = buildFretboard("C", "blues", 0, 3);
		// C blues: C(0), Eb(3), F(5), Gb(6), G(7), Bb(10)
		// Row 0 = high E (pc 4): F(1→d4), F#(2→♭5), G(3→d5)
		expect(board[0][0].degree).toBe("4"); // F
		expect(board[0][1].degree).toBe("♭5"); // F#
		expect(board[0][2].degree).toBe("5"); // G
	});

	it("E blues: root highlighted", () => {
		const board = buildFretboard("E", "blues", 0, 1);
		// E blues: E(4), G(6), A(7), Bb(8), B(9), D(10)
		// Row 0 = high E (pc 4): F(1,out) → not in scale
		expect(board[0][0].degree).toBeUndefined();
	});

	it("middle position (fret 5) assigns correct degrees", () => {
		const board = buildFretboard("C", "major", 5, 3);
		// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
		// Row 0 = high E (pc 4): fret 5 = A(9) → degree 6, fret 6 = A#(10) → null, fret 7 = B(11) → degree 7
		expect(board[0][0].degree).toBe("6");
		expect(board[0][1].degree).toBeUndefined();
		expect(board[0][2].degree).toBe("7");
	});
});
