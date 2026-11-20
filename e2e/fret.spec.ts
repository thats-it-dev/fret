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
	// Cells keep the 4:3 ratio in left-handed mode too
	await expect(async () => {
		const box = await page.locator("scale-view").locator(".cell").first().boundingBox();
		expect(box).not.toBeNull();
		expect(Math.abs(box!.width - box!.height * (4 / 3))).toBeLessThanOrEqual(1);
	}).toPass();
});

test("fretboard cells keep a 4:3 aspect ratio and the board sits on the page background", async ({ page }) => {
	await page.goto("/");
	const board = page.locator("scale-view").locator(".fretboard");
	await expect(board).toBeVisible();
	const cell = page.locator("scale-view").locator(".cell").first();
	const assertRatio = async () => {
		const box = await cell.boundingBox();
		expect(box).not.toBeNull();
		expect(Math.abs(box!.width - box!.height * (4 / 3))).toBeLessThanOrEqual(1);
	};
	await expect(assertRatio).toPass();
	// Same assertion at a narrow (overflow) width, per the spec's "every screen width" claim
	await page.setViewportSize({ width: 320, height: 800 });
	await expect(assertRatio).toPass();
	const [boardBg, pageBg] = await Promise.all([
		board.evaluate((el) => getComputedStyle(el).backgroundColor),
		page.evaluate(() => getComputedStyle(document.body).backgroundColor),
	]);
	expect(boardBg).toBe(pageBg);
});
