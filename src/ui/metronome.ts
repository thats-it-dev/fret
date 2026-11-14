import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { beatIntervalMs, isBeatAccent } from "../metronome.js";

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
				gap: 12px;
			}
			.bpm-display {
				font-size: 18px;
				font-weight: bold;
			}
			button {
				padding: 8px 16px;
			}
		`,
	];

	bpm = 60;
	playing = false;
	private context: AudioContext | null = null;
	private nextBeatTime = 0;
	private startBeat = 0;
	private timerID: number | null = null;

	private playClick(accent: boolean): void {
		if (!this.context) return;
		const osc = this.context.createOscillator();
		const gain = this.context.createGain();
		osc.connect(gain);
		gain.connect(this.context.destination);
		osc.frequency.value = accent ? 880 : 440;
		gain.gain.setValueAtTime(1, this.context.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
		osc.start(this.context.currentTime);
		osc.stop(this.context.currentTime + 0.05);
	}

	private scheduleAhead(): void {
		while (this.nextBeatTime < this.context!.currentTime + 0.1) {
			const elapsed = this.nextBeatTime - this.context!.currentTime;
			const beatOffset = Math.round(elapsed / beatIntervalMs(this.bpm));
			this.playClick(isBeatAccent(this.startBeat + beatOffset));
			this.nextBeatTime += beatIntervalMs(this.bpm);
		}
		this.timerID = requestAnimationFrame(this.scheduleAhead.bind(this));
	}

	private play(): void {
		this.playing = true;
		this.context = new AudioContext();
		this.nextBeatTime = this.context.currentTime + 0.1;
		// @ts-expect-error -- missing on context
		this.context.currentTimeZero = this.nextBeatTime;
		this.scheduleAhead();
	}

	private stop(): void {
		this.playing = false;
		if (this.timerID) {
			cancelAnimationFrame(this.timerID);
			this.timerID = null;
		}
		if (this.context) {
			this.context.close();
			this.context = null;
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
				<span class="bpm-display">${this.bpm} BPM</span>
				<button @click=${this._toggle}>${this.playing ? "Stop" : "Play"}</button>
			</div>
		`;
	}
}
customElements.define("metronome-ui", MetronomeUI);
