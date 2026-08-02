import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { Localizer } from "../services/localize";

/** How long a phone keyboard takes to come up, near enough. */
const KEYBOARD_DELAY = 300;

/**
 * A modal dialog.
 *
 * Mobile first: full screen on phones, centred card on wider screens.
 * Fires `dialog-closed` when dismissed.
 */
@customElement("se-dialog")
export class SeDialog extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public heading = "";

  @property({ type: Boolean, reflect: true }) public open = false;

  /** The press that the next click comes from started on the scrim itself. */
  private pressedOnScrim = false;

  public static styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    /*
     * Swallows the gesture as well as the light.
     *
     * touch-action: none because overscroll-behavior only holds where there is
     * something to scroll: on a dialog shorter than the screen a flick went
     * straight through to the page behind, which on a modal means moving
     * something you cannot see. The content opts back in below.
     */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      touch-action: none;
    }

    .surface {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      width: 100%;
      /*
       * A flex item will not shrink below its content on its own, so a single
       * stubborn field inside could widen the dialog past the screen. The
       * dialog is the one that decides: the content fits in it, not the other
       * way round.
       */
      min-width: 0;
      /*
       * dvh, not vh: a keyboard shrinks the visible viewport but not vh, so the
       * dialog stayed its full height and the field being typed into sat under
       * the keyboard. dvh follows what is actually on screen.
       */
      max-height: 92dvh;
      display: flex;
      flex-direction: column;
      border-radius: 16px 16px 0 0;
    }

    header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      flex: 1;
    }

    .close {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 50%;
    }

    /*
     * Scrolls on its own, and keeps it to itself.
     *
     * overscroll-behavior stops a flick that reaches the end of the dialog from
     * carrying on into the page behind it — which, on a modal, means scrolling
     * something you cannot even see.
     */
    .content {
      padding: 16px;
      overflow-y: auto;
      overscroll-behavior: contain;
      /* The one place a finger may still scroll, and only up and down. */
      touch-action: pan-y;
      flex: 1;
    }

    /*
     * Sits with the buttons, outside the scrolling content: something said
     * about what a button is about to do has to be on screen next to it. Said
     * up in the content, a long dialog would scroll it out of sight, and
     * whoever saw nothing happen would press again — which is the very thing
     * the message is there to prevent.
     *
     * No wrapper: an empty slot renders nothing, so nothing is spaced away.
     */
    ::slotted([slot="banner"]) {
      display: block;
      margin: 12px 16px 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    @media (min-width: 600px) {
      .scrim {
        align-items: center;
      }

      .surface {
        max-width: 520px;
        border-radius: 16px;
      }
    }
  `;

  protected render() {
    return html`
      <div
        class="scrim"
        @pointerdown=${this.handleScrimPointerDown}
        @click=${this.handleScrimClick}
      >
        <div class="surface" role="dialog" aria-modal="true" @click=${this.stop}>
          <header>
            <h2>${this.heading}</h2>
            <button class="close" @click=${this.close} aria-label=${this.localize("close")}>×</button>
          </header>
          <div class="content"><slot></slot></div>
          <slot name="banner"></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </div>
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("focusin", this.keepInView);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.handleKeydown);
    this.removeEventListener("focusin", this.keepInView);
  }

  /**
   * Scroll a field being typed into back into view.
   *
   * A keyboard opening does not move the dialog, and the browser's own effort
   * to reveal the field gives up at the first scrolling ancestor — which here
   * is the dialog, inside a fixed scrim. So a field near the bottom ends up
   * behind the keyboard, being typed into blind.
   *
   * Only for what summons the keyboard, though: an input or a textarea. A
   * button taking focus on a click — a period tab, "edit split" — brings up no
   * keyboard and needs no revealing, and centring it only yanked the dialog
   * down under the tap. The real focused element sits at the foot of the
   * composed path; `event.target` is retargeted to the shadow boundary and
   * could not tell a segmented control from an input.
   *
   * Deferred, because at the moment focus lands the keyboard is not up yet and
   * the viewport has not shrunk: scrolling now would aim at where the field
   * already is. Centred rather than merely revealed, so the next field down is
   * visible too.
   */
  private keepInView = (event: FocusEvent) => {
    const tag = (event.composedPath()[0] as HTMLElement | undefined)?.tagName;

    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target?.scrollIntoView) {
      return;
    }

    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, KEYBOARD_DELAY);
  };

  private close = () => {
    this.open = false;
    this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: true, composed: true }));
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (this.open && event.key === "Escape") {
      this.close();
    }
  };

  /**
   * Dismiss on the scrim, but only for a gesture that stayed on the scrim.
   *
   * A click is dispatched on the nearest ancestor the press and the release
   * have in common, so dragging across a field and letting go a few pixels
   * past the edge of the card lands a click on the scrim itself — the surface
   * is not on the path, `stop` never runs, and the dialog closed on someone
   * merely re-selecting the text they had just typed. Where the press started
   * is what says whether the scrim was really the thing being clicked.
   */
  private handleScrimPointerDown = (event: PointerEvent) => {
    this.pressedOnScrim = event.target === event.currentTarget;
  };

  private handleScrimClick = (event: Event) => {
    const fromScrim = this.pressedOnScrim;

    this.pressedOnScrim = false;

    if (fromScrim && event.target === event.currentTarget) {
      this.close();
    }
  };

  private stop(event: Event) {
    event.stopPropagation();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-dialog": SeDialog;
  }
}
