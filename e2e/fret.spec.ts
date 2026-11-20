import { test, expect } from "./csp.ts";

test("renders the app", async ({ page }) => {
	await page.goto("/");
	// Single-page: no tk-shell, just the app content
	await expect(page.locator("app-main")).toBeVisible();
	await expect(page.locator("scale-view")).toBeVisible();
});

test("set daily goal and see progress update", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("app-main")).toBeVisible();
	// Open Settings sheet
	await page.locator('button[aria-label="Settings"]').click();
	// Fill the goal input inside the sheet
	const goalInput = page.locator("tk-sheet").locator('input[type="number"]');
	await goalInput.fill("30");
	// Close sheet
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	// See the goal reflected in the practice progress text
	await expect(page.locator("practice-ui")).toContainText("30 min");
});

test("render a fretboard with dots for the selected scale", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("app-main")).toBeVisible();
	await expect(page.locator("scale-view")).toBeVisible();
	// The fretboard should render with dots (in-scale elements)
	const dots = page.locator("scale-view").locator(".in-scale");
	// There should be at least one dot (the root note in the position window)
	await expect(dots.first()).toBeVisible();
});

test("scale dots show note names and root is amber-highlighted", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("app-main")).toBeVisible();
	await expect(page.locator("scale-view")).toBeVisible();
	// Root dot shows note name (not finger number): first root = C on 2nd row (B string) fret 1
	const dotText = page.locator("scale-view").locator(".cell.in-scale .dot.root").first().textContent();
	await expect(dotText).resolves.toBe("C");
	// Root dot has the .root class (amber highlight)
	await expect(page.locator("scale-view").locator(".cell.in-scale .dot.root").first()).toHaveClass(/root/);
	// Also assert there are multiple in-scale dots visible
	const allDots = page.locator("scale-view").locator(".cell.in-scale .dot");
	expect(await allDots.count()).toBeGreaterThan(1);
});

test("scale-view shows positionWidth columns from difficulty level", async ({ page }) => {
	await page.goto("/");
	// Default level 1 has positionWidth=5
	const fretboard = page.locator("scale-view").locator(".fretboard");
	await expect(fretboard).toBeVisible();
	// Open Settings sheet and change level
	await page.locator('button[aria-label="Settings"]').click();
	// Change to level 2 (positionWidth=6)
	const select = page.locator("tk-sheet").locator("select");
	await select.selectOption("2");
	// Close sheet
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	await expect(fretboard.locator(".cell")).toHaveCount(36);
	// Open again for level 3
	await page.locator('button[aria-label="Settings"]').click();
	await select.selectOption("3");
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	await expect(fretboard.locator(".cell")).toHaveCount(36);
	// Level 4 (positionWidth=7)
	await page.locator('button[aria-label="Settings"]').click();
	await select.selectOption("4");
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	await expect(fretboard.locator(".cell")).toHaveCount(42);
	// Level 6 (positionWidth=8)
	await page.locator('button[aria-label="Settings"]').click();
	await select.selectOption("6");
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	await expect(fretboard.locator(".cell")).toHaveCount(48);
});

test("start and stop practice session", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("app-main")).toBeVisible();
	// Start the practice session
	const startBtn = page.locator("practice-ui").locator('button');
	await startBtn.click();
	// Wait for the stop button to appear
	await expect(page.locator("practice-ui").locator('button').first()).toContainText("Stop");
	// Stop the practice session
	await startBtn.click();
	// Button should be back to "Start"
	await expect(page.locator("practice-ui").locator('button').first()).toContainText("Start");
});

test("left-handed mode mirrors fretboard", async ({ page }) => {
	await page.goto("/");
	// Clear persisted state so test starts from a clean slate
	await page.evaluate(() => localStorage.removeItem("fret:leftHanded"));
	// Default: first fret-num should be "1"
	await expect(page.locator("scale-view").locator(".fret-num").first()).toHaveText("1");
	// Open Settings sheet and toggle left-handed
	await page.locator('button[aria-label="Settings"]').click();
	// Toggle is now a button with role="switch"
	await page.locator("tk-sheet").locator('button[role="switch"]').click();
	// Close sheet
	await page.locator("tk-sheet").locator("button[aria-label=\"Close\"]").click();
	// Now the board should mirror: fret-num order reversed
	const firstFretNum = await page.locator("scale-view").locator(".fret-num").first().textContent();
	// With 5 frets and startFret=0, normal order is 1-5, reversed is 5-1
	expect(firstFretNum).toBe("5");
	// String labels column should be on the right in left-handed mode
	const labelPositions = await page.locator("scale-view").locator(".string-label").all();
	expect(labelPositions.length).toBe(6);
	await expect(page.locator("scale-view").locator(".string-label").first()).toContainText("1st");
	await expect(page.locator("scale-view").locator(".string-label").last()).toContainText("6th");
	// Cell order should also be reversed
	const cellTitle = await page.locator("scale-view").locator(".cell").first().getAttribute("title");
	expect(cellTitle).toContain("fret 5");
	// Cells keep the 21:9 ratio in left-handed mode too
	await expect(async () => {
		const box = await page.locator("scale-view").locator(".cell").first().boundingBox();
		expect(box).not.toBeNull();
		expect(Math.abs(box!.width - box!.height * (21 / 9))).toBeLessThanOrEqual(1);
	}).toPass();
	// Left-handed: the corner stays borderless and the last fret-number cell carries the axis
	const cornerBorders = await page
		.locator("scale-view")
		.locator(".corner")
		.evaluate((el) => {
			const cs = getComputedStyle(el);
			return `${cs.borderLeftWidth} ${cs.borderRightWidth} ${cs.borderBottomWidth}`;
		});
	expect(cornerBorders).toBe("0px 0px 0px");
	const lhAxisRight = await page
		.locator("scale-view")
		.locator(".fret-num.lh-axis")
		.evaluate((el) => getComputedStyle(el).borderRightWidth);
	expect(lhAxisRight).toBe("2px");
	const lhLabelRight = await page
		.locator("scale-view")
		.locator(".string-label")
		.first()
		.evaluate((el) => getComputedStyle(el).borderRightWidth);
	expect(lhLabelRight).toBe("0px");
});

test("fretboard cells keep a 21:9 aspect ratio and the board sits on the page background", async ({ page }) => {
	await page.goto("/");
	const board = page.locator("scale-view").locator(".fretboard");
	await expect(board).toBeVisible();
	const cell = page.locator("scale-view").locator(".cell").first();
	const assertRatio = async () => {
		const box = await cell.boundingBox();
		expect(box).not.toBeNull();
		expect(Math.abs(box!.width - box!.height * (21 / 9))).toBeLessThanOrEqual(1);
	};
	await expect(assertRatio).toPass();
	// Same ratio at a narrow viewport
	await page.setViewportSize({ width: 320, height: 800 });
	await expect(assertRatio).toPass();
	const [boardBg, pageBg] = await Promise.all([
		board.evaluate((el) => getComputedStyle(el).backgroundColor),
		page.evaluate(() => getComputedStyle(document.body).backgroundColor),
	]);
	expect(boardBg).toBe(pageBg);
	// In-scale cells must not fill differently than blank cells (dots carry the state)
	const [inBg, outBg] = await Promise.all([
		page.locator("scale-view").locator(".cell.in-scale").first().evaluate((el) => getComputedStyle(el).backgroundColor),
		page.locator("scale-view").locator(".cell:not(.in-scale)").first().evaluate((el) => getComputedStyle(el).backgroundColor),
	]);
	expect(inBg).toBe(outBg);
	// Fret separators stay on every cell; the string line exists except on the board's bottom row
	const lastRowBorders = await page.locator("scale-view").locator(".cell.last-row").first().evaluate((el) => {
		const cs = getComputedStyle(el);
		return { bottom: cs.borderBottomWidth, right: cs.borderRightWidth };
	});
	expect(lastRowBorders).toEqual({ bottom: "0px", right: "2px" });
	const normalBottom = await page
		.locator("scale-view")
		.locator(".cell:not(.last-row)")
		.first()
		.evaluate((el) => getComputedStyle(el).borderBottomWidth);
	expect(normalBottom).toBe("2px");
	// The frame surrounds the whole board; the last fret column defers to it (no doubled line)
	const frame = await board.evaluate((el) => {
		const cs = getComputedStyle(el);
		return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(",");
	});
	expect(frame).toBe("2px,2px,2px,2px");
	const lastColRight = await page
		.locator("scale-view")
		.locator(".cell.last-col")
		.first()
		.evaluate((el) => getComputedStyle(el).borderRightWidth);
	expect(lastColRight).toBe("0px");
	// Label axes: a line under the number row and beside the string labels (right-handed default)
	const numBottom = await page
		.locator("scale-view")
		.locator(".fret-num")
		.first()
		.evaluate((el) => getComputedStyle(el).borderBottomWidth);
	expect(numBottom).toBe("2px");
	const labelRight = await page
		.locator("scale-view")
		.locator(".string-label")
		.first()
		.evaluate((el) => getComputedStyle(el).borderRightWidth);
	expect(labelRight).toBe("2px");
	const cornerBorders = await page
		.locator("scale-view")
		.locator(".corner")
		.evaluate((el) => {
			const cs = getComputedStyle(el);
			return `${cs.borderLeftWidth} ${cs.borderRightWidth} ${cs.borderBottomWidth}`;
		});
	expect(cornerBorders).toBe("0px 2px 0px");
});

test("the fretboard fills its container and scrolls when minimums overflow", async ({ page }) => {
	await page.goto("/");
	const board = page.locator("scale-view").locator(".fretboard");
	await expect(board).toBeVisible();
	const cell = page.locator("scale-view").locator(".cell").first();
	await expect(cell).toBeVisible();
	// Tracks are 1fr: every fret column takes its share of the board width (no fixed cap)
	const fills = await board.evaluate((fb) => {
		const cells = fb.querySelectorAll(".cell");
		const cols = cells.length / 6;
		const track = (fb.clientWidth - 32) / cols;
		return Math.abs((cells[0] as HTMLElement).getBoundingClientRect().width - track) <= 2;
	});
	expect(fills).toBe(true);
	// Level 6 (8 frets) at 320px: 8x40px minimums exceed the content box, so the board scrolls
	await page.setViewportSize({ width: 320, height: 800 });
	await page.locator('button[aria-label="Settings"]').click();
	await page.locator("tk-sheet").locator("select").selectOption("6");
	await page.locator("tk-sheet").locator('button[aria-label="Close"]').click();
	await expect(board.locator(".cell")).toHaveCount(48);
	const scrollable = await board.evaluate((el) => el.scrollWidth > el.clientWidth);
	expect(scrollable).toBe(true);
});

test("practice card stacks clock, progress bar and start button", async ({ page }) => {
	await page.goto("/");
	const timer = page.locator("practice-ui .timer");
	const bar = page.locator("practice-ui tk-progress");
	const btn = page.locator("practice-ui button");
	await expect(timer).toBeVisible();
	const t = await timer.boundingBox();
	const b = await bar.boundingBox();
	const s = await btn.boundingBox();
	expect(t).not.toBeNull();
	expect(b).not.toBeNull();
	expect(s).not.toBeNull();
	// Clock sits above the progress bar; the bar sits above the Start button
	expect(t!.y + t!.height).toBeLessThanOrEqual(b!.y + 2);
	expect(b!.y + b!.height).toBeLessThanOrEqual(s!.y + 2);
	// Clock is centered on the card
	const card = await page.locator("practice-ui").boundingBox();
	expect(card).not.toBeNull();
	expect(Math.abs(t!.x + t!.width / 2 - (card!.x + card!.width / 2))).toBeLessThanOrEqual(4);
});

test("metronome is enabled with a switch", async ({ page }) => {
	await page.goto("/");
	const sw = page.getByRole("switch", { name: "metronome" });
	await expect(sw).toHaveAttribute("aria-checked", "false");
	await sw.click();
	await expect(sw).toHaveAttribute("aria-checked", "true");
	await sw.click();
	await expect(sw).toHaveAttribute("aria-checked", "false");
});

test("tapping a common tempo selects it without typing", async ({ page }) => {
	await page.goto("/");
	const readout = page.locator("metronome-ui .bpm-readout");
	await expect(readout).toContainText("60");
	// On load the selected tempo already sits centered on the rail
	await expect(async () => {
		const railBox = await page.locator("metronome-ui .tempo-rail").boundingBox();
		const chip60 = await page.locator("metronome-ui .tempo-chip", { hasText: /^60$/ }).boundingBox();
		expect(Math.abs(chip60!.x + chip60!.width / 2 - (railBox!.x + railBox!.width / 2))).toBeLessThanOrEqual(28);
	}).toPass();
	const chip120 = page.locator("metronome-ui .tempo-chip", { hasText: "120" });
	await chip120.click();
	await expect(readout).toContainText("120");
	await expect(chip120).toHaveAttribute("aria-pressed", "true");
	// The selected tempo is the one centered on the rail
	await expect(async () => {
		const railBox = await page.locator("metronome-ui .tempo-rail").boundingBox();
		const chipBox = await chip120.boundingBox();
		expect(Math.abs(chipBox!.x + chipBox!.width / 2 - (railBox!.x + railBox!.width / 2))).toBeLessThanOrEqual(28);
	}).toPass();
});

test("swiping the tempo rail picks the centered common tempo", async ({ page }) => {
	await page.goto("/");
	const rail = page.locator("metronome-ui .tempo-rail");
	await expect(rail).toBeVisible();
	// Swipe to the far end of the rail
	await rail.evaluate((el) => {
		el.scrollLeft = el.scrollWidth;
	});
	await expect(page.locator("metronome-ui .bpm-readout")).toContainText("180");
	await expect(page.locator("metronome-ui .tempo-chip", { hasText: "180" })).toHaveAttribute(
		"aria-pressed",
		"true",
	);
});

test("the highlighted tempo follows the rail centre mid-swipe", async ({ page }) => {
	await page.goto("/");
	const rail = page.locator("metronome-ui .tempo-rail");
	// Stop the rail mid-travel, between two snap points
	await rail.evaluate((el) => {
		el.scrollLeft = 120;
	});
	await expect(async () => {
		const boxes = await page.locator("metronome-ui .tempo-chip").evaluateAll((els) =>
			els.map((e) => {
				const b = e.getBoundingClientRect();
				return { center: b.left + b.width / 2, text: e.textContent || "", pressed: e.getAttribute("aria-pressed") === "true" };
			}),
		);
		const railBox = await rail.boundingBox();
		const railCenter = railBox!.x + railBox!.width / 2;
		const nearest = boxes!.reduce((best, c) => (Math.abs(c.center - railCenter) < Math.abs(best.center - railCenter) ? c : best));
		expect(nearest.pressed).toBe(true);
		await expect(page.locator("metronome-ui .bpm-readout")).toContainText(nearest.text!);
	}).toPass();
});

test("the tempo rail shows no scrollbar", async ({ page }) => {
	await page.goto("/");
	const hidden = await page
		.locator("metronome-ui .tempo-rail")
		.evaluate((el) => getComputedStyle(el).scrollbarWidth === "none");
	expect(hidden).toBe(true);
});

test("sections carry no headers", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("app-main h2")).toHaveCount(0);
});

test("the switch drives the audio context (iOS suspended start)", async ({ page }) => {
	await page.addInitScript(() => {
		const w = window as unknown as { __audio: { resumes: number; starts: number }; AudioContext: unknown };
		w.__audio = { resumes: 0, starts: 0 };
		class FakeCtx {
			state = "suspended";
			currentTime = 0;
			sampleRate = 44100;
			destination = {};
			constructor() {
				setInterval(() => {
					if (this.state === "running") this.currentTime += 0.02;
				}, 16);
			}
			createOscillator() {
				return {
					frequency: { value: 0 },
					connect: () => {},
					start: () => {
						w.__audio.starts++;
					},
					stop: () => {},
				};
			}
			createGain() {
				return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} };
			}
			createBuffer() {
				return {};
			}
			createBufferSource() {
				return { buffer: null, connect: () => {}, start: () => {} };
			}
			resume() {
				w.__audio.resumes++;
				this.state = "running";
				return Promise.resolve();
			}
			close() {
				this.state = "closed";
				return Promise.resolve();
			}
		}
		w.AudioContext = FakeCtx;
	});
	await page.goto("/");
	await page.getByRole("switch", { name: "metronome" }).click();
	await expect(async () => {
		const a = await page.evaluate(() => (window as unknown as { __audio: { resumes: number; starts: number } }).__audio);
		expect(a.resumes).toBeGreaterThanOrEqual(1);
		expect(a.resumes).toBeLessThanOrEqual(3);
		expect(a.starts).toBeGreaterThanOrEqual(2);
	}).toPass();
});

test("a blocked audio session flips the switch back off", async ({ page }) => {
	await page.addInitScript(() => {
		const w = window as unknown as { __audio: { resumes: number }; AudioContext: unknown };
		w.__audio = { resumes: 0 };
		class FakeCtx {
			state = "suspended";
			currentTime = 0;
			sampleRate = 44100;
			destination = {};
			createOscillator() {
				return { frequency: { value: 0 }, connect: () => {}, start: () => {}, stop: () => {} };
			}
			createGain() {
				return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} };
			}
			createBuffer() {
				return {};
			}
			createBufferSource() {
				return { buffer: null, connect: () => {}, start: () => {} };
			}
			resume() {
				w.__audio.resumes++;
				return new Promise<void>(() => {});
			}
			close() {
				return Promise.resolve();
			}
		}
		w.AudioContext = FakeCtx;
	});
	await page.goto("/");
	const sw = page.getByRole("switch", { name: "metronome" });
	await sw.click();
	await expect(sw).toHaveAttribute("aria-checked", "true");
	await expect(sw).toHaveAttribute("aria-checked", "false", { timeout: 15000 });
	const resumes = await page.evaluate(() => (window as unknown as { __audio: { resumes: number } }).__audio.resumes);
	expect(resumes).toBeLessThanOrEqual(3);
});
