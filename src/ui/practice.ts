import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { getTodayMs, formatDuration } from "../goals.js";

export class PracticeUI extends LitElement {
	static properties = {
		sessionMs: { type: Number },
		started: { type: Boolean },
		goalMin: { type: Number },
		todayMs: { type: Number },
	};

	static styles = [
		sharedStyles,
		css`
			.practice-row {
				display: flex;
				align-items: center;
				gap: 12px;
				flex-wrap: wrap;
			}
			.timer {
				font-size: 16px;
				font-variant-numeric: tabular-nums;
				min-width: 80px;
			}
		`,
	];

	sessionMs = 0;
	started = false;
	goalMin = 20;
	todayMs = 0;
	private startTime = 0;
	private timerId: ReturnType<typeof setInterval> | null = null;

	start(): void {
		this.started = true;
		this.startTime = Date.now();
		this.timerId = setInterval(() => {
			this.sessionMs = Date.now() - this.startTime;
		}, 100);
	}

	stop(): void {
		this.started = false;
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
		import("../goals.js").then((m) => {
			m.addSessionDuration(this.sessionMs);
			this.sessionMs = 0;
		});
	}

	_toggle(): void {
		if (this.started) {
			this.stop();
		} else {
			this.start();
		}
	}

	render() {
		const minutes = Math.floor(this.sessionMs / 60000);
		const seconds = Math.floor((this.sessionMs % 60000) / 1000);
		const display = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

		const progress = this.goalMin > 0 ? Math.min(this.todayMs / (this.goalMin * 60 * 1000), 1) : 0;
		const pct = Math.round(progress * 100);
		const displayed = formatDuration(this.todayMs);

		return html`
			<div class="practice-row">
				<button class="btn" @click=${this._toggle}>${this.started ? "Stop" : "Start"}</button>
				<span class="timer">${display}</span>
			</div>
			<tk-progress label="today" unit="min" .value=${Math.round(this.todayMs / 60000)} .max=${this.goalMin}></tk-progress>
		`;
	}
}
customElements.define("practice-ui", PracticeUI);
