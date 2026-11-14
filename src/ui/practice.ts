import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";

export class PracticeUI extends LitElement {
	static properties = {
		sessionMs: { type: Number },
		started: { type: Boolean },
	};

	static styles = [
		sharedStyles,
		css`
			.practice-row {
				display: flex;
				align-items: center;
				gap: 12px;
			}
			button {
				padding: 8px 16px;
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

		return html`
			<div class="practice-row">
				<button @click=${this._toggle}>${this.started ? "Stop" : "Start"}</button>
				<span class="timer">${display}</span>
			</div>
		`;
	}
}
customElements.define("practice-ui", PracticeUI);
