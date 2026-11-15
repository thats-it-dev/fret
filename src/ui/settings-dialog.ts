import { html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { DIFFICULTY_LEVELS } from "../difficulty.js";
import type { CSSResultGroup } from "https://kit.thatsit.app/lit.js";

export interface SettingsDialogProps {
	/** The currently selected difficulty level */
	level: number;
	/** Whether the user is left-handed */
	leftHanded: boolean;
	/** Daily goal in minutes */
	goalMin: number;
	/** Called when the level changes */
	onLevel: (level: number) => void;
	/** Called when the left-handed toggle changes */
	onLeftHanded: (leftHanded: boolean) => void;
	/** Called when the daily goal changes */
	onGoal: (goalMin: number) => void;
	/** Close callback (backdrop click); passes whether to keep open */
	onClose: (open: boolean) => void;
	/** Whether the sheet is open */
	open: boolean;
}

/**
 * Settings modal modeled on keeb's settings-dialog.
 * Two-column panel: label left, control right.
 *
 * Clicks on the ::backdrop land on the dialog element itself, not on its children,
 * which is how the dialog closes on a click outside — the caller owns that test.
 */
export function settingsDialog(p: SettingsDialogProps) {
	return html`
		<tk-sheet heading="Settings" .open=${p.open} @tk-close=${() => p.onClose(false)}>
			<div class="form">
				<label>level</label>
				<select id="level" @change=${(e: Event) => {
					const val = parseInt((e.target as HTMLSelectElement).value, 10);
					p.onLevel(val);
				}}>
					${DIFFICULTY_LEVELS.map((d) => html`<option value="${d.level}" ?selected=${d.level === p.level}>${d.name} (${d.bpm} bpm, position ${d.positionWidth})</option>`)}
				</select>
				<label>Left-handed</label>
				<button class="switch" role="switch" aria-checked="${String(p.leftHanded)}" aria-label="Left-handed" @click=${() => p.onLeftHanded(!p.leftHanded)}></button>
				<label>Daily goal (min)</label>
				<input id="goal" type="number" min="0" max="240" step="5" .value=${String(p.goalMin)} @change=${(e: Event) => {
					const val = parseInt((e.target as HTMLInputElement).value, 10);
					if (!isNaN(val) && val >= 0) p.onGoal(val);
				}} />
			</div>
		</tk-sheet>
	`;
}

export const settingsDialogStyles: CSSResultGroup = [sharedStyles, css`
	.form {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 14px 16px;
		align-items: center;
	}
	.form label {
		color: var(--text-secondary);
	}
	.form input:not([type="checkbox"]):not([type="radio"]),
	.form select {
		width: 220px;
		max-width: 100%;
		justify-self: end;
	}
	.form .switch {
		justify-self: end;
		position: relative;
		width: 40px;
		height: 22px;
		border-radius: var(--radius);
		background: var(--surface);
		cursor: pointer;
		transition: background 0.2s ease;
	}
	.form .switch[aria-checked="true"] {
		background: var(--primary);
	}
	.form .switch::after {
		content: "";
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		background: var(--bg);
		border-radius: 50%;
		transition: transform 0.2s ease;
	}
	.form .switch[aria-checked="true"]::after {
		transform: translateX(18px);
	}
	.form .hint,
	.form .error {
		grid-column: 1 / -1;
		margin-top: -10px;
		font-size: 0.85rem;
	}
	.form .hint {
		color: var(--text-muted);
	}
	.form .error {
		color: var(--accent);
	}
	.form input[aria-invalid="true"],
	.form select[aria-invalid="true"] {
		border-color: var(--accent);
	}
	@media (max-width: 480px) {
		.form input:not([type="checkbox"]):not([type="radio"]),
		.form select {
			width: 160px;
		}
	}
`];

