import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import type { FretCell } from "../fretboard.js";

export interface ScaleViewEventMap {
	"scale-change": CustomEvent<{ root: string; scale: string; startFret: number }>;
}

declare global {
	interface HTMLElementEventMap extends ScaleViewEventMap {}
}

export class ScaleView extends LitElement {
	static properties = {
		root: { type: String },
		scale: { type: String },
		startFret: { type: Number },
		fretboard: { type: Array },
	};

	static styles = [
		sharedStyles,
		css`
			.fretboard {
				display: grid;
				grid-template-columns: 32px repeat(15, 1fr);
				gap: 1px;
				overflow-x: auto;
				padding: 8px;
				border: 1px solid var(--tk-border-subtle);
				border-radius: var(--tk-radius-md);
			}
			.fretboard .string-label {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 11px;
				color: var(--tk-text-subtle);
			}
			.fretboard .fret-numbers {
				display: flex;
				gap: 1px;
				margin-left: 32px;
			}
			.fretboard .fret-numbers span {
				flex: 1;
				text-align: center;
				font-size: 10px;
				color: var(--tk-text-subtle);
			}
			.fretboard .cell {
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1px solid var(--tk-border-subtle);
				font-size: 10px;
				min-height: 28px;
				position: relative;
			}
			.fretboard .cell.in-scale {
				background: var(--tk-fill-subtle);
			}
			.fretboard .cell.in-scale::after {
				content: "";
				position: absolute;
				width: 10px;
				height: 10px;
				border-radius: 50%;
				background: var(--tk-accent-fill);
			}
			.fretboard .cell.open {
				border-color: var(--tk-text-on-surface);
			}
			.controls {
				display: flex;
				gap: 12px;
				align-items: center;
				flex-wrap: wrap;
				padding: 8px 0;
			}
			.controls label {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 13px;
			}
			.controls select,
			.controls input {
				font-size: 13px;
				padding: 4px 6px;
				border: 1px solid var(--tk-border);
				border-radius: var(--tk-radius-sm);
				background: var(--tk-fill);
				color: var(--tk-text);
			}
		`,
	];

	root = "C";
	scale = "majorPentatonic";
	startFret = 0;
	fretboard: FretCell[][] = [];

	private _buildBoard(): void {
		import("../fretboard.js").then(({ buildFretboard }) => {
			this.fretboard = buildFretboard(this.root, this.scale, this.startFret);
		});
	}

	firstUpdated(): void {
		this._buildBoard();
	}

	_updated(_changed: Map<string, unknown>): void {
		this._buildBoard();
	}

	_onRootChange(e: Event): void {
		this.root = (e.target as HTMLSelectElement).value;
		this.dispatchEvent(new CustomEvent("scale-change", { detail: { root: this.root, scale: this.scale, startFret: this.startFret } }));
	}

	_onScaleChange(e: Event): void {
		this.scale = (e.target as HTMLSelectElement).value;
		this.dispatchEvent(new CustomEvent("scale-change", { detail: { root: this.root, scale: this.scale, startFret: this.startFret } }));
	}

	_onFretChange(e: Event): void {
		this.startFret = parseInt((e.target as HTMLSelectElement).value, 10);
		this.dispatchEvent(new CustomEvent("scale-change", { detail: { root: this.root, scale: this.scale, startFret: this.startFret } }));
	}

	render() {
		return html`
			<div class="controls">
				<label>
					Root
					<select @change=${this._onRootChange}>
						${["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(
							(n) => html`<option value="${n}" ?selected=${n === this.root}>${n}</option>`,
						)}
					</select>
				</label>
				<label>
					Scale
					<select @change=${this._onScaleChange}>
						${[
							["majorPentatonic", "Major Pentatonic"],
							["minorPentatonic", "Minor Pentatonic"],
							["major", "Major"],
							["naturalMinor", "Natural Minor"],
							["blues", "Blues"],
						].map(([id, label]) => html`<option value="${id}" ?selected=${id === this.scale}>${label}</option>`)}
					</select>
				</label>
				<label>
					Start fret
					<select @change=${this._onFretChange}>
						${Array.from({ length: 6 }, (_, i) => html`<option value="${i}" ?selected=${i === this.startFret}>${i}</option>`)}
					</select>
				</label>
			</div>
			${this.fretboard.length > 0
				? html`<div class="fretboard">
						<div class="fret-numbers">
							<span></span>
							${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((f) => html`<span>${f}</span>`)}
						</div>
						${this.fretboard.map(
							(row, s) => html`<div class="string-label">${["6th", "5th", "4th", "3rd", "2nd", "1st"][s]}</div>${row.map(
								(cell, f) => html`<div class="cell ${cell.inScale ? "in-scale" : ""} ${cell.fret === null ? "open" : ""}" title="${f === 0 ? "open" : "fret " + f}: ${cell.note}">${cell.fret === null ? "○" : cell.note}</div>`,
							)}`,
						)}
					</div>`
				: ""}
		`;
	}
}
customElements.define("scale-view", ScaleView);
