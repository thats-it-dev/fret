import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { scheduleBeats, type ScheduleState } from "../metronome.js";

export class MetronomeUI extends LitElement {
	static properties = {
		bpm: { type: Number },
		playing: { type: Boolean },
	};

	static styles = [
		sharedStyles,
		css`
			.container {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12px;
				flex-wrap: wrap;
			}
		`,
	];

	bpm = 60;
	playing = false;
	private context: AudioContext | null = null;
	private state: ScheduleState = { nextBeatTimeSec: 0, nextBeatIndex: 0 };
	private rafId: number | null = null;

	private playClick(accent: boolean, whenSec: number): void {
		if (!this.context) return;
		const osc = this.context.createOscillator();
		const gain = this.context.createGain();
		osc.connect(gain);
		gain.connect(this.context.destination);
		osc.frequency.value = accent ? 880 : 440;
		gain.gain.setValueAtTime(1, whenSec);
		gain.gain.exponentialRampToValueAtTime(0.01, whenSec + 0.05);
		osc.start(whenSec);
		osc.stop(whenSec + 0.05);
	}

	private tick = (): void => {
		if (!this.context) return;
		const scheduled = scheduleBeats(this.state, this.context.currentTime, this.bpm);
		for (const event of scheduled.events) {
			this.playClick(event.accent, event.timeSec);
		}
		this.state = scheduled.state;
		this.rafId = requestAnimationFrame(this.tick);
	};

	private play(): void {
		this.playing = true;
		this.context = new AudioContext();
		this.state = { nextBeatTimeSec: this.context.currentTime + 0.1, nextBeatIndex: 0 };
		this.rafId = requestAnimationFrame(this.tick);
	}

	private stop(): void {
		this.playing = false;
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		if (this.context) {
			void this.context.close();
			this.context = null;
		}
	}

	private _onBpmChange(e: Event): void {
		const value = parseInt((e.target as HTMLInputElement).value, 10);
		if (Number.isFinite(value) && value > 0) {
			this.bpm = value;
		}
	}

	_toggle(): void {
		if (this.playing) {
			this.stop();
		} else {
			this.play();
		}
	}

	render() {
		return html`
			<div class="container">
				<label class="label">
					tempo
					<input type="number" min="30" max="240" step="1" .value=${String(this.bpm)} aria-label="Tempo in BPM" @change=${this._onBpmChange} />
				</label>
				<button class="btn" @click=${this._toggle}>${this.playing ? "Stop" : "Play"}</button>
			</div>
		`;
	}
}
customElements.define("metronome-ui", MetronomeUI);
