import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";

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
				display: grid;
				gap: 12px;
				justify-items: center;
			}
			.timer {
				font-size: 24px;
				font-variant-numeric: tabular-nums;
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

		return html`
			<div class="practice-row">
				<span class="timer">${display}</span>
				<tk-progress
					label="today"
					unit="min"
					.value=${Math.round(this.todayMs / 60000)}
					.max=${this.goalMin}
					.pct=${progress}
				></tk-progress>
				<button class="btn" @click=${this._toggle}>${this.started ? "Stop" : "Start"}</button>
			</div>
		`;
	}
}
customElements.define("practice-ui", PracticeUI);
