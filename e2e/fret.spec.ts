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
	// There should be at least one dot (the root note on the open string)
	await expect(dots.first()).toBeVisible();
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
