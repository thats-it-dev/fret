const GOAL_KEY = "fret:goal";
const TODAY_KEY = "fret:today";

export interface DailyStats {
	date: string; // ISO date string (YYYY-MM-DD in local time)
	totalMs: number;
}

function todayKey(): string {
	return new Date().toISOString().slice(0, 10);
}

function sessionsKey(): string {
	return "fret:sessions";
}

/**
 * Get today's session duration in milliseconds.
 */
export function getTodayMs(): number {
	const raw = localStorage.getItem(TODAY_KEY);
	if (!raw) return 0;
	try {
		const parsed = JSON.parse(raw) as DailyStats;
		if (parsed.date !== todayKey()) return 0; // stale day
		return parsed.totalMs ?? 0;
	} catch {
		return 0;
	}
}

/**
 * Add a session duration to today's total.
 */
export function addSessionDuration(ms: number): void {
	const key = TODAY_KEY;
	let stats: DailyStats;
	const raw = localStorage.getItem(key);
	if (raw) {
		try {
			stats = JSON.parse(raw) as DailyStats;
		} catch {
			stats = { date: todayKey(), totalMs: 0 };
		}
	} else {
		stats = { date: todayKey(), totalMs: 0 };
	}
	stats.totalMs += ms;
	localStorage.setItem(key, JSON.stringify(stats));
}

/**
 * Get the daily goal in minutes.
 */
export function getGoalMinutes(): number {
	const raw = localStorage.getItem(GOAL_KEY);
	if (!raw) return 20;
	try {
		const val = parseInt(raw, 10);
		return isNaN(val) ? 20 : Math.max(0, val);
	} catch {
		return 20;
	}
}

/**
 * Set the daily goal in minutes.
 */
export function setGoalMinutes(minutes: number): void {
	if (!Number.isFinite(minutes) || minutes < 0) {
		throw new Error(`Goal must be a non-negative number, got ${minutes}`);
	}
	localStorage.setItem(GOAL_KEY, String(minutes));
}

/**
 * Format milliseconds into a human-readable string.
 * Returns "0m" for 0, "1h 2m" for hours+minutes, or "Xm" for minutes only.
 */
export function formatDuration(ms: number): string {
	if (ms < 0) throw new Error("Duration cannot be negative");
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	if (minutes > 0 && seconds > 0) {
		return `${minutes}m ${seconds}s`;
	}
	if (minutes > 0) {
		return `${minutes}m`;
	}
	return `${seconds}s`;
}

/**
 * Calculate progress ratio (0-1) towards the daily goal.
 * @returns 0 if no goal set, capped at 1.
 */
export function getProgressRatio(): number {
	const goalMin = getGoalMinutes();
	if (goalMin <= 0) return 0;
	const totalMs = getTodayMs();
	const goalMs = goalMin * 60 * 1000;
	return Math.min(totalMs / goalMs, 1);
}
