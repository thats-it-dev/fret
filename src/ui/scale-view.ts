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
	};

	static styles = [
		sharedStyles,
		css`
			.fretboard {
				display: grid;
				gap: 1px;
				overflow-x: auto;
				padding: 8px;
				border: 1px solid var(--line);
				border-radius: var(--radius);
			}
			.fretboard .string-label {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 11px;
				color: var(--text-muted);
			}
			.fretboard .cell {
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1px solid var(--line);
				font-size: 10px;
				min-height: 28px;
				position: relative;
			}
			.fretboard .cell.in-scale {
				background: var(--panel);
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
				width: 18px;
				height: 18px;
				border-radius: 50%;
				font-size: 8px;
				font-weight: 600;
				color: var(--bg);
				background: var(--text-primary);
			}
			.fretboard .cell.in-scale .dot.root {
				background: var(--primary);
			}
			.fret-numbers {
				display: grid;
				gap: 1px;
				padding: 0 8px 8px;
			}
			.fret-numbers span {
				text-align: center;
				font-size: 10px;
				color: var(--text-muted);
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
				border: 1px solid var(--border-color);
				border-radius: var(--radius);
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

	private _buildFn?: typeof import("../fretboard.js").buildFretboard;

	async firstUpdated(): Promise<void> {
		const mod = await import("../fretboard.js");
		this._buildFn = mod.buildFretboard;
		this._buildBoard();
	}

	updated(changed: Map<string, unknown>): void {
		if (changed.has("positionWidth") || changed.has("root") || changed.has("scale") || changed.has("startFret")) {
			this._buildBoard();
		}
	}

	private _buildBoard(): void {
		if (!this._buildFn) return;
		this.fretboard = this._buildFn(this.root, this.scale, this.startFret, this.positionWidth);
	}

	private _renderCell(cell: FretCell): import("https://kit.thatsit.app/lit.js").TemplateResult | string {
		if (cell.inScale) {
			return html`<span class="dot ${cell.degree === '1' ? 'root' : ''}">${cell.degree}</span>`;
		}
		if (cell.fret === null) {
			return html`<span class="dot"></span>`;
		}
		return cell.note;
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
			? html`<div class="fretboard" style="grid-template-columns: 32px repeat(${this.fretboard[0]?.length ?? 0}, 1fr);">
					${this.fretboard.map(
						(row, s) => html`<div class="string-label">${["6th", "5th", "4th", "3rd", "2nd", "1st"][s]}</div>${row.slice().reverse().map(
							(cell) => html`<div class="cell ${cell.inScale ? "in-scale" : ""} ${cell.fret === null ? "open" : ""}" title="${cell.fret === null ? "open" : "fret " + cell.fret}: ${cell.note}">${this._renderCell(cell)}</div>`,
						)}`,
					)}
				</div>
				<div class="fret-numbers" style="grid-template-columns: 32px repeat(${this.fretboard[0]?.length ?? 0}, 1fr);">
					<span></span>
					${Array.from({ length: this.fretboard[0]?.length ?? 0 }, (_, i) => {
						const fretNum = i === 0 && this.startFret === 0 ? 0 : this.startFret + i;
						return html`<span>${fretNum}</span>`;
					}).reverse()}
				</div>`
				: ""}
		`;
	}
}
customElements.define("scale-view", ScaleView);
