import { LitElement, html, css } from "https://kit.thatsit.app/lit.js";
import { sharedStyles } from "https://kit.thatsit.app/kit.js";
import { getDifficultyLevel } from "../difficulty.js";

export interface DifficultyChangeEvent extends CustomEvent {
	detail: { level: number };
}

declare global {
	interface HTMLElementEventMap {
		"difficulty-change": DifficultyChangeEvent;
	}
}

export class DifficultyUI extends LitElement {
	static properties = {
		level: { type: Number },
	};

	static styles = [
		sharedStyles,
		css`
			.difficulty-row {
				display: flex;
				align-items: center;
				gap: 12px;
			}
			select {
				padding: 6px 10px;
				border: 1px solid var(--tk-border);
				border-radius: var(--tk-radius-sm);
				background: var(--tk-fill);
				color: var(--tk-text);
				font-size: 13px;
			}
		`,
	];

	level = 1;

	_onChange(e: Event): void {
		this.level = parseInt((e.target as HTMLSelectElement).value, 10);
		this.dispatchEvent(new CustomEvent("difficulty-change", { detail: { level: this.level } }));
	}

	render() {
		const current = getDifficultyLevel(this.level);
		return html`
			<div class="difficulty-row">
				<label>
					Difficulty
					<select @change=${this._onChange}>
						${Array.from({ length: 6 }, (_, i) => {
							const l = i + 1;
							const cfg = getDifficultyLevel(l);
							return html`<option value="${l}" ?selected=${l === this.level}>${cfg.name} (${cfg.bpm} bpm)</option>`;
						})}
					</select>
				</label>
				<span class="info">Current: ${current.name} · ${current.bpm} BPM · position ${current.positionWidth}</span>
			</div>
		`;
	}
}
customElements.define("difficulty-selector", DifficultyUI);
