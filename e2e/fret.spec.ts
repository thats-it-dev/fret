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
