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
	// Find the goal input inside goal-ui and set a value
	const goalInput = page.locator("goal-ui").locator('input[type="number"]');
	await goalInput.fill("30");
	// Click the refresh button to trigger the change event
	await page.locator("goal-ui").locator('button.ghost').click();
	// Now see the goal reflected in the progress text
	await expect(page.locator("goal-ui").locator("span").first()).toContainText("30");
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
	// Count cells — should be positionWidth (5 for level 1) columns
	const cells = fretboard.locator(".cell").first();
	await expect(cells).toBeVisible();
	// Change to level 2 (positionWidth=6)
	await page.locator("#level-select").selectOption("2");
	await expect(fretboard.locator(".cell")).toHaveCount(36);
	// Change to level 3 (positionWidth=6)
	await page.locator("#level-select").selectOption("3");
	await expect(fretboard.locator(".cell")).toHaveCount(36);
	// Change to level 4 (positionWidth=7)
	await page.locator("#level-select").selectOption("4");
	await expect(fretboard.locator(".cell")).toHaveCount(42);
	// Change to level 6 (positionWidth=8)
	await page.locator("#level-select").selectOption("6");
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
	// Toggle left-handed checkbox
	await page.locator("scale-view").locator("label:has-text('Left-handed') input[type='checkbox']").check({ force: true });
	// Now the board should mirror: fret-num order reversed
	// First fret-num header should now show the highest fret in the window
	const firstFretNum = await page.locator("scale-view").locator(".fret-num").first().textContent();
	// With 5 frets and startFret=0, normal order is 1-5, reversed is 5-1
	expect(firstFretNum).toBe("5");
	// String labels should NOT reverse: 1st appears first, 6th last
	await expect(page.locator("scale-view").locator(".string-label").first()).toContainText("1st");
	await expect(page.locator("scale-view").locator(".string-label").last()).toContainText("6th");
	// Cell order should also be reversed
	const cellTitle = await page.locator("scale-view").locator(".cell").first().getAttribute("title");
	// First cell should be in the 6th string (low E) at the highest fret
	expect(cellTitle).toContain("fret 5");
});
