import "./ui/scale-view.js";
import "./ui/metronome.js";
import "./ui/practice.js";
import { LitElement, html, css, nothing } from "https://kit.thatsit.app/lit.js";
import { sharedStyles, toast } from "https://kit.thatsit.app/kit.js";
import { DIFFICULTY_LEVELS } from "../src/difficulty.js";
import { getGoalMinutes, getTodayMs, setGoalMinutes } from "../src/goals.js";
import { settingsDialog, settingsDialogStyles, showDialog } from "./ui/settings-dialog.js";

export class AppMain extends LitElement {
	static properties = {
		_level: { type: Number },
		_settingsOpen: { type: Boolean },
		_leftHanded: { type: Boolean },
		_goalMin: { type: Number },
	};

	static styles = [
		settingsDialogStyles,
		sharedStyles,
		css`
			.page {
				max-width: 800px;
				margin: 0 auto;
				padding: 20px;
				display: grid;
				gap: 20px;
			}
			@media (max-width: 600px) {
				.page {
					padding: 12px;
					gap: 14px;
				}
			}
			.title-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-wrap: wrap;
				gap: 8px;
			}
			h1 {
				font-size: 22px;
				margin: 0;
			}
			.section {
				padding: 16px;
			}
			.icon-btn {
				background: none;
				border: 0;
				padding: 0;
				cursor: pointer;
				display: grid;
				place-items: center;
				color: var(--text-muted);
			}
			.icon-btn:hover { color: var(--text-primary); }
			.section h2 {
				margin: 0 0 12px;
				font-size: 16px;
			}
			/* Dialog modal styles */
			dialog {
				border: 1px solid var(--border-color);
				border-radius: calc(var(--radius) * 2);
				background: var(--bg);
				color: var(--text-primary);
				padding: 0;
				box-shadow: 0 18px 50px var(--shadow-color);
				width: min(24rem, calc(100vw - 2rem));
			}
			dialog::backdrop {
				background: color-mix(in srgb, var(--text-primary), transparent 62%);
				backdrop-filter: blur(3px);
			}
			.modal-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 12px 14px;
				border-bottom: 1px solid var(--border-color);
			}
			.x {
				display: grid;
				place-items: center;
				width: 36px;
				height: 36px;
				flex: none;
				border: 0;
				background: none;
				border-radius: var(--radius);
				color: var(--text-muted);
			}
			.x:hover {
				color: var(--text-primary);
				background: var(--code-bg);
			}
			.panel {
				display: grid;
				grid-template-columns: auto 1fr;
				gap: 14px 16px;
				align-items: center;
				padding: 16px 14px;
			}
			.panel label {
				display: contents;
			}
			.panel label > .label {
				justify-self: start;
			}
			.panel label > select,
			.panel label > input {
				justify-self: end;
				width: 100%;
				max-width: 12rem;
			}
			.full {
				grid-column: 1 / -1;
			}
		`,
	];

	_level = parseInt(localStorage.getItem("fret:level") ?? "1", 10);
	_leftHanded = localStorage.getItem("fret:leftHanded") === "true";
	_settingsOpen = false;
	_goalMin = getGoalMinutes();

	render() {
		const todayMs = getTodayMs();
		const levelConfig = DIFFICULTY_LEVELS.find((d) => d.level === this._level);
		const positionWidth = levelConfig?.positionWidth ?? 5;
		return html`
			<div class="page">
				<div class="title-row">
					<h1>Fret</h1>
					<button class="icon-btn" aria-label="Settings" aria-haspopup="dialog" @click=${() => this._toggleSettings(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
				</button>
				</div>

				<div class="section">
					<h2>Scales</h2>
					<scale-view .positionWidth=${positionWidth} .leftHanded=${this._leftHanded}></scale-view>
				</div>

				<div class="section">
					<h2>Metronome</h2>
					<metronome-ui id="metro"></metronome-ui>
				</div>

				<div class="section">
					<h2>Practice</h2>
					<practice-ui id="practice" .goalMin=${this._goalMin} .todayMs=${todayMs}></practice-ui>
				</div>

				${this._settingsOpen ? settingsDialog({
					level: this._level,
					leftHanded: this._leftHanded,
					goalMin: this._goalMin,
					onLevel: (level: number) => { localStorage.setItem("fret:level", String(level)); this._level = level; const c = DIFFICULTY_LEVELS.find((d) => d.level === level); if (c) { const m = this.shadowRoot?.querySelector("metronome-ui"); if (m && "bpm" in m) (m as HTMLElement & { bpm: number }).bpm = c.bpm; toast(`${c.name} — ${c.bpm} BPM`); } },
					onLeftHanded: (lh) => this._onLeftHandedChange(lh),
					onGoal: (gm: number) => { this._onGoalChange(gm); },
					onClose: (open) => this._settingsOpen = open,
				}) : nothing}
			</div>
		`;
	}

	_toggleSettings(open: boolean): void {
		this._settingsOpen = open;
	}

	_onLeftHandedChange(leftHanded: boolean): void {
		localStorage.setItem("fret:leftHanded", String(leftHanded));
		this._leftHanded = leftHanded;
		toast(`Left-handed mode ${leftHanded ? "on" : "off"}`);
	}

	_onGoalChange(goalMin: number): void {
		setGoalMinutes(goalMin);
		this._goalMin = goalMin;
		toast(`Daily goal set to ${goalMin} min`);
	}

	updated(changed: Map<string, unknown>): void {
		if (changed.has("_settingsOpen")) {
			showDialog(this.renderRoot, this._settingsOpen);
		}
	}

}

customElements.define("app-main", AppMain);
