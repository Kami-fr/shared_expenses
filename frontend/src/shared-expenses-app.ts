import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./pages/se-dashboard-page";
import "./pages/se-group-page";
import { SharedExpensesApi } from "./services/api";
import { localizer, type Localizer } from "./services/localize";
import type { HomeAssistant, Route } from "./types";

/**
 * Root of the Shared Expenses panel.
 *
 * Home Assistant sets `hass`, `narrow`, `route` and `panel` on this element.
 * Navigation is kept in the URL so that the back button works.
 */
@customElement("shared-expenses-panel")
export class SharedExpensesPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route?: Route;

  @state() private groupId?: string;

  private api?: SharedExpensesApi;

  public static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;

  public connectedCallback(): void {
    super.connectedCallback();

    this.syncFromRoute();
    window.addEventListener("popstate", this.syncFromRoute);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.syncFromRoute);
  }

  protected willUpdate(): void {
    if (this.hass && !this.api) {
      this.api = new SharedExpensesApi(this.hass);
    }
  }

  protected render() {
    if (!this.hass || !this.api) {
      return html``;
    }

    const localize: Localizer = localizer(this.hass.locale?.language ?? this.hass.language);
    const language = this.hass.locale?.language ?? this.hass.language;

    if (this.groupId) {
      return html`
        <se-group-page
          .api=${this.api}
          .localize=${localize}
          .groupId=${this.groupId}
          .language=${language}
          @navigate-back=${this.goToDashboard}
        ></se-group-page>
      `;
    }

    return html`
      <se-dashboard-page
        .api=${this.api}
        .localize=${localize}
        @group-selected=${this.handleGroupSelected}
      ></se-dashboard-page>
    `;
  }

  private syncFromRoute = () => {
    const path = this.route?.path ?? window.location.pathname;
    const match = /\/group\/([^/?#]+)/.exec(path);

    this.groupId = match ? match[1] : undefined;
  };

  private handleGroupSelected = (event: CustomEvent) => {
    this.groupId = event.detail.groupId;
    this.pushPath(`/group/${this.groupId}`);
  };

  private goToDashboard = () => {
    this.groupId = undefined;
    this.pushPath("");
  };

  private pushPath(suffix: string) {
    const prefix = this.route?.prefix ?? window.location.pathname.split("/")[1];

    history.pushState(null, "", `${prefix.startsWith("/") ? prefix : `/${prefix}`}${suffix}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-panel": SharedExpensesPanel;
  }
}
