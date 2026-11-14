import "./ui/scale-view.js";
import "./ui/difficulty.js";
import "./ui/metronome.js";
import "./ui/practice.js";
import "./ui/goal.js";
import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles, toast } from "https://kit.thatsit.app/kit.js";
import { DIFFICULTY_LEVELS } from "../src/difficulty.js";
import { getGoalMinutes, getTodayMs } from "../src/goals.js";

export class AppMain extends LitElement {
	static styles = [
		sharedStyles,
		css`
			.page {
				max-width: 800px;
				margin: 0 auto;
				padding: 20px;
				display: grid;
				gap: 20px;
			}
			h1 {
				font-size: 22px;
				margin: 0 0 4px;
			}
			.section {
				padding: 16px;
				border: 1px solid var(--tk-border-subtle);
				border-radius: var(--tk-radius-md);
			}
			.section h2 {
				margin: 0 0 12px;
				font-size: 16px;
			}
			.row {
				display: flex;
				gap: 10px;
				align-items: center;
				flex-wrap: wrap;
			}
		`,
	];

	render() {
		const goalMin = getGoalMinutes();
		const todayMs = getTodayMs();
		return html`
			<div class="page">
				<h1>Fret</h1>

				<div class="section">
					<h2>Scales</h2>
					<scale-view></scale-view>
				</div>

				<div class="section">
					<h2>Difficulty</h2>
					<div class="row">
						<label>
							Level
							<select id="level-select" @change=${this._onLevelChange}>
								${DIFFICULTY_LEVELS.map((d) => html`<option value="${d.level}">${d.name} (${d.bpm} bpm, position ${d.positionWidth})</option>`)}
							</select>
						</label>
					</div>
				</div>

				<div class="section">
					<h2>Metronome</h2>
					<metronome-ui id="metro"></metronome-ui>
				</div>

				<div class="section">
					<h2>Practice</h2>
					<practice-ui id="practice"></practice-ui>
				</div>

				<div class="section">
					<h2>Goal</h2>
					<goal-ui id="goal" .goalMin=${goalMin} .todayMs=${todayMs}></goal-ui>
				</div>
			</div>
		`;
	}

	_onLevelChange(e: Event): void {
		const level = parseInt((e.target as HTMLSelectElement).value, 10);
		localStorage.setItem("fret:level", String(level));
		const levelConfig = DIFFICULTY_LEVELS.find((d) => d.level === level);
		if (levelConfig) {
			const metro = this.shadowRoot!.querySelector("metronome-ui");
			if (metro && "bpm" in metro) {
				(metro as HTMLElement & { bpm: number }).bpm = levelConfig.bpm;
			}
			toast(`${levelConfig.name} — ${levelConfig.bpm} BPM`);
		}
	}
}

customElements.define("app-main", AppMain);
