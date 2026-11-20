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
		positionWidth: { type: Number },
		fretboard: { type: Array },
		leftHanded: { type: Boolean },
	};

	static styles = [
		sharedStyles,
		css`
			.fretboard {
				display: grid;
				justify-content: safe center;
				overflow-x: auto;
				padding: 8px 0;
				background: var(--bg);
			}
			.fretboard .string-label {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 11px;
				color: var(--text-muted);
			}
			.fretboard .corner {
			}
			.fretboard .fret-num {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 10px;
				color: var(--text-muted);
			}
			.fretboard .cell {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 10px;
				aspect-ratio: 21 / 9;
				position: relative;
				background: transparent;
				border-right: 2px solid var(--line);
				border-bottom: 2px solid var(--line);
			}
			.fretboard .cell.last-row {
				border-bottom: 0;
			}
			.fretboard .cell.open .dot {
				width: 8px;
				height: 8px;
				background: var(--border-color);
				color: var(--text-muted);
			}
			.fretboard .cell.in-scale .dot {
				display: flex;
				align-items: center;
				justify-content: center;
				width: auto;
				height: min(18px, 100%);
				aspect-ratio: 1;
				border-radius: 50%;
				font-size: 8px;
				font-weight: 600;
				color: var(--bg);
				background: var(--text-primary);
			}
			.fretboard .cell.in-scale .dot.root {
				background: var(--primary);
				color: var(--bg);
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
				border: 0;
				background: var(--panel);
				color: var(--text-primary);
			}
		`,
	];

	root = "C";
	scale = "majorPentatonic";
	startFret = 0;
	positionWidth = 5;
	fretboard: FretCell[][] = [];
	leftHanded = false;

	private _buildFn?: typeof import("../fretboard.js").buildFretboard;

	async firstUpdated(): Promise<void> {
		const mod = await import("../fretboard.js");
		this._buildFn = mod.buildFretboard;
		this._buildBoard();
	}

	updated(changed: Map<string, unknown>): void {
		if (changed.has("positionWidth") || changed.has("root") || changed.has("scale") || changed.has("startFret") || changed.has("leftHanded")) {
			this._buildBoard();
		}
	}

	private _buildBoard(): void {
		if (!this._buildFn) return;
		this.fretboard = this._buildFn(this.root, this.scale, this.startFret, this.positionWidth);
	}

	private _renderCell(cell: FretCell): import("https://kit.thatsit.app/lit.js").TemplateResult | string {
		if (cell.inScale) {
			const cls = `dot ${cell.degree === '1' ? 'root' : ''}`;
			return html`<span class="${cls}">${cell.note}</span>`;
		}
		return '';
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
					<span class="label">Root</span>
					<select @change=${this._onRootChange}>
						${["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(
							(n) => html`<option value="${n}" ?selected=${n === this.root}>${n}</option>`,
						)}
					</select>
				</label>
				<label>
					<span class="label">Scale</span>
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
					<span class="label">Start fret</span>
					<select @change=${this._onFretChange}>
						${Array.from({ length: 6 }, (_, i) => html`<option value="${i}" ?selected=${i === this.startFret}>${i}</option>`)}
					</select>
				</label>
			</div>
		${this.fretboard.length > 0
		? html`<div class="fretboard" style="grid-template-columns: ${this.leftHanded ? `repeat(${this.fretboard[0]?.length ?? 0}, minmax(40px, 1fr)) 32px` : `32px repeat(${this.fretboard[0]?.length ?? 0}, minmax(40px, 1fr))`};">
					${this.leftHanded
							? html`${Array.from({ length: this.fretboard[0]?.length ?? 0 }, (_, i) => {
									const cols = this.fretboard[0]?.length ?? 0;
									const fretNum = this.startFret === 0 ? cols - i : this.startFret + cols - 1 - i;
									return html`<div class="fret-num">${fretNum}</div>`;
									})}<div class="corner"></div>${this.fretboard.map(
									(row, s) => html`${row.slice().reverse().map(
										(cell) => html`<div class="cell ${cell.inScale ? "in-scale" : ""}${s === this.fretboard.length - 1 ? " last-row" : ""}" title="fret ${cell.fret}: ${cell.note}">${this._renderCell(cell)}</div>`,
									)}<div class="string-label">${["1st", "2nd", "3rd", "4th", "5th", "6th"][s]}</div>`,
								)}`
							: html`<div class="corner"></div>
							${Array.from({ length: this.fretboard[0]?.length ?? 0 }, (_, i) => {
									const fretNum = this.startFret === 0 ? i + 1 : this.startFret + i;
									return html`<div class="fret-num">${fretNum}</div>`;
									})}${this.fretboard.map(
									(row, s) => html`<div class="string-label">${["1st", "2nd", "3rd", "4th", "5th", "6th"][s]}</div>${row.map(
										(cell) => html`<div class="cell ${cell.inScale ? "in-scale" : ""}${s === this.fretboard.length - 1 ? " last-row" : ""}" title="fret ${cell.fret}: ${cell.note}">${this._renderCell(cell)}</div>`,
									)}`,
								)}`}
					</div>`
				: ""}
		`;
	}
}
customElements.define("scale-view", ScaleView);
