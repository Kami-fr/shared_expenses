import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-color-picker";
import "../components/se-field";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, initials } from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { GroupMember, HaUser, Member } from "../types";

/**
 * Manage who is in a group.
 *
 * Home Assistant accounts are toggled on and off, which is also what grants
 * access to the group. People without an account are added by name: they carry
 * expenses but will never log in.
 *
 * Fires `members-changed` on close when something was saved.
 */
@customElement("se-member-dialog")
export class SeMemberDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @state() private haUsers: HaUser[] = [];

  @state() private members: Member[] = [];

  @state() private memberships: GroupMember[] = [];

  @state() private newName = "";

  @state() private loading = true;

  @state() private busy?: string;

  @state() private error?: string;

  @state() private dirty = false;

  /** The member whose palette is open, if any. */
  @state() private tinting?: string;

  public static styles = [
    sharedStyles,
    css`
      .section + .section {
        margin-top: 20px;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row .name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tag {
        font-size: 11px;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .add {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .add se-field {
        flex: 1;
      }

      .tintable {
        border: none;
        cursor: pointer;
        font-family: inherit;
      }

      .palette {
        padding: 4px 0 12px 48px;
      }

      .remove {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        font-size: 18px;
        cursor: pointer;
        padding: 0 4px;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog open heading=${translate("members")} @dialog-closed=${this.close}>
        ${this.loading
          ? html`<div class="empty">${translate("loading")}</div>`
          : html`
              <div>
                ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
                ${this.renderAccounts()} ${this.renderGuests()}
              </div>
            `}

        <se-button slot="actions" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderAccounts() {
    const translate = this.localize;

    return html`
      <div class="section">
        <h3>${translate("ha_accounts")}</h3>
        <div class="muted">${translate("ha_accounts_hint")}</div>

        ${this.haUsers.length === 0
          ? html`<div class="empty">${translate("no_ha_accounts")}</div>`
          : this.haUsers.map((user) => this.renderAccount(user))}
      </div>
    `;
  }

  private renderAccount(user: HaUser) {
    const member = this.memberForUser(user.id);
    const owner = this.isOwner(member);

    return html`
      <div class="row">
        <input
          type="checkbox"
          .checked=${member !== undefined}
          ?disabled=${owner || this.busy !== undefined}
          title=${owner ? this.localize("owner_locked") : ""}
          @change=${() => this.toggleAccount(user, member)}
        />
        ${this.renderTintable(member, user.name, user.id)}
        <span class="name">${user.name}</span>
        ${owner
          ? html`<span class="tag">${this.localize("group_owner")}</span>`
          : nothing}
      </div>
      ${this.renderPalette(member)}
    `;
  }

  /**
   * A member's avatar, clickable to recolour them.
   *
   * The avatar is what the colour actually shows up in, so it is the obvious
   * thing to press. Members with no account yet have nothing to recolour.
   */
  private renderTintable(member: Member | undefined, name: string, seed: string) {
    const color = member?.color ?? colorFor(seed);

    if (!member) {
      return html`
        <div class="avatar" style=${`background:${color}`}>${initials(name)}</div>
      `;
    }

    return html`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${color}`}
        @click=${() => this.toggleTint(member.id)}
      >
        ${initials(name)}
      </button>
    `;
  }

  private renderPalette(member: Member | undefined) {
    if (!member || this.tinting !== member.id) {
      return nothing;
    }

    return html`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${member.color}
          .fallback=${colorFor(member.id)}
          @value-changed=${(e: CustomEvent) => this.tint(member, e.detail.value)}
        ></se-color-picker>
      </div>
    `;
  }

  private toggleTint(memberId: string) {
    this.tinting = this.tinting === memberId ? undefined : memberId;
  }

  private async tint(member: Member, color: string | null) {
    this.busy = member.id;
    this.error = undefined;

    try {
      await this.api.updateMember(member.id, { color });

      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  }

  private renderGuests() {
    const translate = this.localize;
    const guests = this.members.filter((member) => member.user_id === null);

    return html`
      <div class="section">
        <h3>${translate("guests")}</h3>
        <div class="muted">${translate("guests_hint")}</div>

        ${guests.map(
          (member) => html`
            <div class="row">
              ${this.renderTintable(member, member.name, member.id)}
              <span class="name">${member.name}</span>
              <button
                class="remove"
                ?disabled=${this.busy !== undefined}
                aria-label=${translate("remove_member")}
                @click=${() => this.removeGuest(member)}
              >
                ×
              </button>
            </div>
            ${this.renderPalette(member)}
          `,
        )}

        <div class="add">
          <se-field
            .label=${translate("member_name")}
            .value=${this.newName}
            placeholder="Clara"
            @value-changed=${(e: CustomEvent) => (this.newName = e.detail.value)}
          ></se-field>
          <se-button
            variant="text"
            ?disabled=${this.busy !== undefined || this.newName.trim() === ""}
            @click=${this.addGuest}
          >
            ${translate("add")}
          </se-button>
        </div>
      </div>
    `;
  }

  private memberForUser(userId: string): Member | undefined {
    return this.members.find((member) => member.user_id === userId);
  }

  /** The owner stays: the backend refuses to let them out of their group. */
  private isOwner(member: Member | undefined): boolean {
    if (!member) {
      return false;
    }

    return this.memberships.some(
      (membership) =>
        membership.member_id === member.id &&
        membership.left_at === null &&
        membership.role === "owner",
    );
  }

  private async load() {
    this.error = undefined;

    try {
      const [haUsers, members, memberships] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMemberships(this.groupId),
      ]);

      this.haUsers = haUsers;
      this.members = members;
      this.memberships = memberships;
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.loading = false;
    }
  }

  private async toggleAccount(user: HaUser, member: Member | undefined) {
    this.busy = user.id;
    this.error = undefined;

    try {
      if (member) {
        await this.api.removeMemberFromGroup(this.groupId, member.id);
      } else {
        // Attaches the account, reusing the member it already has elsewhere.
        await this.api.createMember({
          name: user.name,
          group_id: this.groupId,
          user_id: user.id,
        });
      }

      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  }

  private addGuest = async () => {
    this.busy = "new";
    this.error = undefined;

    try {
      await this.api.createMember({
        name: this.newName.trim(),
        group_id: this.groupId,
      });

      this.newName = "";
      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  };

  private async removeGuest(member: Member) {
    this.busy = member.id;
    this.error = undefined;

    try {
      await this.api.removeMemberFromGroup(this.groupId, member.id);

      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  }

  private close = () => {
    // Every change already hit the backend: tell the page only if there was one.
    this.dispatchEvent(
      new CustomEvent(this.dirty ? "members-changed" : "dialog-cancelled", {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-member-dialog": SeMemberDialog;
  }
}
