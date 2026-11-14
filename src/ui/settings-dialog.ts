import { html } from "https://kit.thatsit.app/lit.js";
import { DIFFICULTY_LEVELS } from "../difficulty.js";

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
		<dialog @close=${() => p.onClose(false)} @click=${(e: MouseEvent) => {
			if (e.target === e.currentTarget) p.onClose(false);
		}} aria-label="Settings">
			<div class="modal-head">
				<span class="label">settings</span>
				<button class="x" aria-label="Close settings" @click=${() => p.onClose(false)}>✕</button>
			</div>
			<div class="panel">
				<label>
					<span class="label">level</span>
					<select @change=${(e: Event) => {
						const val = parseInt((e.target as HTMLSelectElement).value, 10);
						p.onLevel(val);
					}}>
						${DIFFICULTY_LEVELS.map((d) => html`<option value="${d.level}" ?selected=${d.level === p.level}>${d.name} (${d.bpm} bpm, position ${d.positionWidth})</option>`)}
					</select>
				</label>
				<label class="full">
					<input type="checkbox" .checked=${p.leftHanded} @change=${(e: Event) => {
						p.onLeftHanded((e.target as HTMLInputElement).checked);
					}} />
					<span class="label">left-handed</span>
				</label>
				<label>
					<span class="label">daily goal (min)</span>
					<input type="number" min="0" max="240" step="5" .value=${String(p.goalMin)} @change=${(e: Event) => {
						const val = parseInt((e.target as HTMLInputElement).value, 10);
						if (!isNaN(val) && val >= 0) p.onGoal(val);
					}} />
				</label>
			</div>
		</dialog>
	`;
}

// showModal() and close() are imperative, so the reactive flag on the page drives them once per update.
export function showDialog(root: DocumentFragment | HTMLElement, open: boolean): void {
	const dlg = root.querySelector("dialog") as HTMLDialogElement | null;
	if (!dlg || dlg.open === open) return;
	if (open) dlg.showModal();
	else dlg.close();
}

