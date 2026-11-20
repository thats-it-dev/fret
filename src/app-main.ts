import "./ui/scale-view.js";
import "./ui/metronome.js";
import "./ui/practice.js";
import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles, toast, SETTINGS_ICON } from "https://kit.thatsit.app/kit.js";
import { DIFFICULTY_LEVELS } from "../src/difficulty.js";
import { getGoalMinutes, getTodayMs, setGoalMinutes } from "../src/goals.js";
import { settingsDialog, settingsDialogStyles } from "./ui/settings-dialog.js";

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
			/* Let sections shrink so the fretboard's own overflow-x scrolls instead of widening the page */
			.page > * {
				min-width: 0;
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
					<button class="icon-btn" aria-label="Settings" @click=${() => this._settingsOpen = true}>
					${SETTINGS_ICON}
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

				${settingsDialog({
					level: this._level,
					leftHanded: this._leftHanded,
					goalMin: this._goalMin,
					onLevel: (level: number) => { localStorage.setItem("fret:level", String(level)); this._level = level; const c = DIFFICULTY_LEVELS.find((d) => d.level === level); if (c) { const m = this.shadowRoot?.querySelector("metronome-ui"); if (m && "bpm" in m) (m as HTMLElement & { bpm: number }).bpm = c.bpm; toast(`${c.name} — ${c.bpm} BPM`); } },
					onLeftHanded: (lh) => this._onLeftHandedChange(lh),
					onGoal: (gm: number) => { this._onGoalChange(gm); },
					onClose: (open) => { this._settingsOpen = open; },
					open: this._settingsOpen,
				})}
			</div>
		`;
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



}

customElements.define("app-main", AppMain);
