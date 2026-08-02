import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface SegmentedOption {
  value: string;
  label: string;
}

/**
 * A labelled choice between two or three named things, all of them on screen.
 *
 * Fires `value-changed` with the chosen value in `event.detail.value` — the same
 * shape `se-select` fires, and the same three properties, so the two are
 * swappable and a form does not care which it is holding.
 *
 * It exists because a dropdown asks two gestures for a choice between two, and
 * shows one of them at a time. What this is for — which way an expense goes,
 * whether a movement is a reimbursement or a debt — is not a value picked from
 * a list but a fork with two named sides, and both sides belong on screen: the
 * question "what else could this be?" is the one a reader has, and opening a
 * list to answer it is a step for nothing.
 *
 * Not an invention. The statistics have drawn their period and their chart this
 * way since they were written; this is that control, given a label and an API,
 * so the two places that ask a form question with it stop each drawing their
 * own. Past three or four options it is the wrong control and `se-select` is
 * the right one: these sit side by side, and side by side has a width.
 */
@customElement("se-segmented")
export class SeSegmented extends LitElement {
  @property({ type: String }) public label = "";

  @property({ type: String }) public value = "";

  @property({ attribute: false }) public options: SegmentedOption[] = [];

  @property({ type: Boolean }) public disabled = false;

  public static styles = css`
    :host {
      display: block;
    }

    /* The label of a field, down to the 13px and the 6px: this is one. */
    label {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    /*
     * The track, and the same track the statistics wear: a sunk strip in the
     * divider's own colour, with the chosen one lifted out of it. Full width
     * here rather than fitted to its content, because in a column of fields a
     * control narrower than the rest reads as a different kind of thing.
     */
    .seg {
      display: flex;
      gap: 2px;
      padding: 3px;
      border-radius: 12px;
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
    }

    .seg button {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      color: var(--secondary-text-color);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 9px;
      cursor: pointer;
      /*
       * A long option is cut rather than allowed to push the other one narrow:
       * two segments that resize as you switch between them read as the control
       * moving under the finger. "Remboursement d'enseigne" is the one that
       * needs it, on the narrowest glass in common use.
       */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .seg button:disabled {
      cursor: default;
    }

    /* The chosen one, in the theme's own colour: this is a decision, and the
       decision is what the eye should land on. */
    .seg button[aria-pressed="true"] {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .seg button:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 1px;
    }
  `;

  protected render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}
      <div class="seg" role="group" aria-label=${this.label || nothing}>
        ${this.options.map(
          (option) => html`
            <button
              type="button"
              aria-pressed=${option.value === this.value ? "true" : "false"}
              ?disabled=${this.disabled}
              title=${option.label}
              @click=${() => this.choose(option.value)}
            >
              ${option.label}
            </button>
          `,
        )}
      </div>
    `;
  }

  private choose(value: string) {
    if (value === this.value) {
      return;
    }

    this.value = value;

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-segmented": SeSegmented;
  }
}
