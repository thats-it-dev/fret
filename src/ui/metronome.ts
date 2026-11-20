import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { scheduleBeats, nearestIndex, nearestCommonBpm, COMMON_BPM, type ScheduleState } from "../metronome.js";

export class MetronomeUI extends LitElement {
	static properties = {
		bpm: { type: Number },
		playing: { type: Boolean },
	};

	static styles = [
		sharedStyles,
		css`
			.container {
				display: grid;
				justify-items: center;
				gap: 14px;
			}
			.bpm-readout {
				font-size: 1.8rem;
				font-variant-numeric: tabular-nums;
			}
			/* Swipeable rail: the highlighted tempo stays at the centre; touch-first, so no
			   scrollbar is shown */
			.tempo-rail {
				display: flex;
				gap: 6px;
				width: min(100%, 320px);
				overflow-x: auto;
				scroll-snap-type: x mandatory;
				padding: 6px 0;
				scrollbar-width: none;
			}
			.tempo-rail::-webkit-scrollbar {
				display: none;
			}
			/* Spacers so the first and last tempo can reach the centre (fixed against the
			   320px rail: half-rail 160 minus half-chip ~26; percentage widths are indeterminate
			   inside a scroll container) */
			.rail-pad {
				flex: 0 0 auto;
				width: 134px;
			}
			.tempo-chip {
				scroll-snap-align: center;
				flex: 0 0 auto;
				min-width: 44px;
				min-height: 44px;
				font-variant-numeric: tabular-nums;
			}
			.tempo-chip[aria-pressed="true"] {
				color: var(--primary);
				border-color: var(--primary);
			}
			.switch-row {
				display: flex;
				align-items: center;
				gap: 10px;
			}
		`,
	];

	bpm = 60;
	playing = false;
	private context: AudioContext | null = null;
	private state: ScheduleState = { nextBeatTimeSec: 0, nextBeatIndex: 0 };
	private rafId: number | null = null;
	private scrollSyncPending = false;
	private fromRail = false;
	private resumePending = false;
	private waitingFrames = 0;

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
		if (this.context.state !== "running") {
			/* iOS can start (or return from the background with) a frozen context: retry the
			   resume at most one call at a time and give up, switching the UI back off, rather
			   than looping forever on a session that will not open */
			this.waitingFrames++;
			if (this.waitingFrames > 120) {
				this.stop();
				return;
			}
			if (this.context.state === "suspended" && !this.resumePending) {
				this.resumePending = true;
				this.context
					.resume()
					.then(() => {
						this.resumePending = false;
					})
					.catch(() => {
						this.resumePending = false;
					});
			}
			/* keep the bar position; re-anchor only the clock */
			this.state = { nextBeatTimeSec: this.context.currentTime + 0.1, nextBeatIndex: this.state.nextBeatIndex };
			this.rafId = requestAnimationFrame(this.tick);
			return;
		}
		this.waitingFrames = 0;
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
		/* iOS: a context created in a gesture can still start suspended and its clock is
		   frozen until resume() lands; tick retries while that settles */
		this.waitingFrames = 0;
		if (this.context.state === "suspended") {
			this.resumePending = true;
			this.context
				.resume()
				.then(() => {
					this.resumePending = false;
				})
				.catch(() => {
					this.resumePending = false;
				});
		}
		/* iOS unlock: one empty buffer started inside the gesture opens the audio session */
		const unlock = this.context.createBufferSource();
		unlock.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
		unlock.connect(this.context.destination);
		unlock.start(0);
		this.state = { nextBeatTimeSec: this.context.currentTime + 0.1, nextBeatIndex: 0 };
		this.rafId = requestAnimationFrame(this.tick);
	}

	private stop(): void {
		this.playing = false;
		this.resumePending = false;
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		if (this.context) {
			void this.context.close();
			this.context = null;
		}
	}

	/* The highlighted tempo follows the rail centre on every scroll frame, so it stays
	   centered while the user swipes rather than only after the rail settles */
	private _onRailScroll(): void {
		if (this.scrollSyncPending) return;
		this.scrollSyncPending = true;
		requestAnimationFrame(() => {
			this.scrollSyncPending = false;
			const rail = this.renderRoot.querySelector<HTMLElement>(".tempo-rail");
			if (!rail) return;
			const chips = Array.from(rail.querySelectorAll<HTMLElement>(".tempo-chip"));
			const railBox = rail.getBoundingClientRect();
			const centers = chips.map((c) => {
				const b = c.getBoundingClientRect();
				return b.left + b.width / 2 - railBox.left;
			});
			const idx = nearestIndex(centers, railBox.width / 2);
			if (idx >= 0 && this.bpm !== COMMON_BPM[idx]) {
				this.fromRail = true;
				this.bpm = COMMON_BPM[idx];
			}
		});
	}

	private _pickChip(index: number): void {
		if (this.bpm !== COMMON_BPM[index]) {
			this.fromRail = true;
			this.bpm = COMMON_BPM[index];
		}
		this._centerOn(index, "smooth");
	}

	firstUpdated(): void {
		this._centerOn(COMMON_BPM.indexOf(nearestCommonBpm(this.bpm)), "instant");
	}

	updated(changed: Map<string, unknown>): void {
		if (changed.has("bpm")) {
			/* a rail-originated change is already centered by the tap itself */
			if (this.fromRail) {
				this.fromRail = false;
				return;
			}
			this._centerOn(COMMON_BPM.indexOf(nearestCommonBpm(this.bpm)), "smooth");
		}
	}

	/* Scroll the chosen chip to the rail centre, where a snap point exists for it */
	private _centerOn(index: number, behavior: ScrollBehavior): void {
		const rail = this.renderRoot.querySelector<HTMLElement>(".tempo-rail");
		const chip = rail?.querySelectorAll<HTMLElement>(".tempo-chip")[index];
		if (!rail || !chip) return;
		const railBox = rail.getBoundingClientRect();
		const chipBox = chip.getBoundingClientRect();
		const target = rail.scrollLeft + chipBox.left + chipBox.width / 2 - (railBox.left + railBox.width / 2);
		if (Math.abs(target - rail.scrollLeft) < 2) return;
		rail.scrollTo({ left: target, behavior });
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
				<span class="bpm-readout">${this.bpm} <span class="label">bpm</span></span>
				<div class="tempo-rail" role="group" aria-label="Common tempos" @scroll=${this._onRailScroll}>
					<span class="rail-pad" aria-hidden="true"></span>
					${COMMON_BPM.map(
						(b, i) => html`<button
							class="btn ghost tempo-chip"
							aria-pressed=${b === this.bpm ? "true" : "false"}
							@click=${() => this._pickChip(i)}
						>${b}</button>`,
					)}
					<span class="rail-pad" aria-hidden="true"></span>
				</div>
				<div class="switch-row">
					<span class="label" id="metro-switch-label">metronome</span>
					<button
						class="switch"
						role="switch"
						aria-checked=${String(this.playing)}
						aria-labelledby="metro-switch-label"
						@click=${this._toggle}
					></button>
				</div>
			</div>
		`;
	}
}
customElements.define("metronome-ui", MetronomeUI);
