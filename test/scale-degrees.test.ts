import { describe, expect, it } from "vitest";
import { buildFretboard } from "../src/fretboard.js";

describe("buildFretboard — degree field", () => {
	it("C major: C=1, D=2, E=3, F=4, G=5, A=6, B=7", () => {
		const board = buildFretboard("C", "major", 0, 2);
		const cells = board[0]; // low E string: E(4), F(5)
		// at fret 0 (open E): note E, in C major → degree 3
		expect(cells[0]?.degree).toBe("3");
		// at fret 1 (F): note F, in C major → degree 4
		expect(cells[1]?.degree).toBe("4");
	});

	it("C major: all 7 degrees at first position", () => {
		const board = buildFretboard("C", "major", 0, 8);
		// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
		// Low E string (pc=4): E(open), F(1), F#(2), G(3), G#(4), A(5), A#(6), B(7)
		// Open E(4): in scale → degree 3
		expect(board[0][0].degree).toBe("3");
		// F(5): degree 4
		expect(board[0][1].degree).toBe("4");
		// F#(6): not in scale → null
		expect(board[0][2].degree).toBeUndefined();
		// G(7): degree 5
		expect(board[0][3].degree).toBe("5");
		// G#(8): not in scale → null
		expect(board[0][4].degree).toBeUndefined();
		// A(9): degree 6
		expect(board[0][5].degree).toBe("6");
		// A#(10): not in scale → null
		expect(board[0][6].degree).toBeUndefined();
		// B(11): degree 7
		expect(board[0][7].degree).toBe("7");
	});

	it("C major pentatonic: degrees 1,2,3,5,6", () => {
		const board = buildFretboard("C", "majorPentatonic", 0, 8);
		// C major pentatonic: C(0), D(2), E(4), G(7), A(9)
		// Low E string: E(4), F(5), F#(6), G(7), G#(8), A(9), A#(10), B(11)
		expect(board[0][0].degree).toBe("3"); // E is the 3rd
		expect(board[0][3].degree).toBe("5"); // G
		expect(board[0][5].degree).toBe("6"); // A
	});

	it("A natural minor: root=A highlighted as degree 1", () => {
		const board = buildFretboard("A", "naturalMinor", 0, 5);
		// A natural minor: A(9), B(11), C(0), D(2), E(4), F(5), G(7)
		// High E string is board[5] (pc=4): E(open), F(1), F#(2), G(3), G#(4)
		// Open E(4): degree 5 (E is the 5th of A minor)
		expect(board[5][0].degree).toBe("5");
		// F(5): degree ♭6
		expect(board[5][1].degree).toBe("♭6");
	});

	it("C natural minor: C=1 at root", () => {
		const board = buildFretboard("C", "naturalMinor", 3, 1);
		// C natural minor: C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
		// Low E string (pc=4): E at fret 3 = G(7) → degree 5
		expect(board[0][0].degree).toBe("5");
	});

	it("C blues: degrees 1,♭3,4,5,♭5,♭7", () => {
		const board = buildFretboard("C", "blues", 0, 3);
		// C blues: C(0), Eb(3), F(5), Gb(6), G(7), Bb(10)
		// Low E string: E(4), F(5), F#(6)
		// E open: not in scale → null
		expect(board[0][0].degree).toBeUndefined();
		// F(5): degree 4
		expect(board[0][1].degree).toBe("4");
		// F#(6): degree ♭5
		expect(board[0][2].degree).toBe("♭5");
	});

	it("E blues: root highlighted", () => {
		const board = buildFretboard("E", "blues", 0, 1);
		// E blues: E(4), G(6), A(7), Bb(8), B(9), D(10)
		// Low E string (pc=4): E(open) → degree 1
		expect(board[0][0].degree).toBe("1");
	});

	it("middle position (fret 5) assigns correct degrees", () => {
		const board = buildFretboard("C", "major", 5, 3);
		// C major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
		// Low E string (pc=4): fret 5 = A(9) → degree 6, fret 6 = A#(10) → null, fret 7 = B(11) → degree 7
		expect(board[0][0].degree).toBe("6");
		expect(board[0][1].degree).toBeUndefined();
		expect(board[0][2].degree).toBe("7");
	});
});
