import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { getGoalMinutes, setGoalMinutes, getTodayMs, formatDuration, getProgressRatio } from "../goals.js";

export class GoalUI extends LitElement {
	static properties = {
		goalMin: { type: Number },
		todayMs: { type: Number },
	};

	static styles = [
		sharedStyles,
		css`
			.goal-row {
				display: flex;
				align-items: center;
				gap: 12px;
				flex-wrap: wrap;
			}
			.goal-row label {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 13px;
			}
			.goal-row input {
				width: 60px;
				padding: 4px 6px;
				border: 1px solid var(--border-color);
				border-radius: var(--radius);
				background: var(--panel);
				color: var(--text-primary);
				font-size: 13px;
			}
			.progress-bar {
				height: 8px;
				border-radius: var(--radius);
				background: var(--surface);
				overflow: hidden;
				min-width: 120px;
			}
			.progress-fill {
				height: 100%;
				background: var(--accent);
				transition: width 0.3s ease;
			}
		`,
	];

	goalMin = 20;
	todayMs = 0;

	firstUpdated(): void {
		this.goalMin = getGoalMinutes();
		this.todayMs = getTodayMs();
	}

	_onGoalChange(e: Event): void {
		const val = parseInt((e.target as HTMLInputElement).value, 10);
		if (!isNaN(val) && val >= 0) {
			setGoalMinutes(val);
			this.goalMin = val;
		}
	}

	_onRefresh(): void {
		this.goalMin = getGoalMinutes();
		this.todayMs = getTodayMs();
	}

	render() {
		const progress = getProgressRatio();
		const pct = Math.round(progress * 100);
		const displayed = formatDuration(this.todayMs);

		return html`
			<div class="goal-row">
				<label>
					Daily goal
					<input type="number" min="0" step="1" .value=${this.goalMin} @change=${this._onGoalChange} />
					min
				</label>
				<button class="ghost" @click=${this._onRefresh}>↻ Refresh</button>
				<div class="progress-bar">
					<div class="progress-fill" style="width: ${pct}%"></div>
				</div>
				<span>${displayed} / ${this.goalMin}min (${pct}%)</span>
			</div>
		`;
	}
}
customElements.define("goal-ui", GoalUI);
