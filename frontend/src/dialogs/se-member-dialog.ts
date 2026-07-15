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
import type { GroupMember, GroupRole, HaUser, Member } from "../types";

/**
 * Manage who is in a project.
 *
 * Home Assistant accounts are toggled on and off, which is also what grants
 * access to the project. People without an account are added by name: they
 * carry expenses but will never log in.
 *
 * Open to everybody, whatever the project allows: this is where you recolour
 * yourself and where you leave. What you may do to other people is what closes.
 *
 * Fires `members-changed` on close when something was saved.
 */
@customElement("se-member-dialog")
export class SeMemberDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  /** What the reader is here. Handing the project on is the admin's alone. */
  @property({ attribute: false }) public role: GroupRole | null = null;

  /** Which member the reader is, if any. Yourself is always yours to change. */
  @property({ type: String }) public meId: string | null = null;

  /** Whether the project lets the reader touch anybody but themselves. */
  @property({ type: Boolean }) public mayManage = false;

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

  /** The member whose removal is awaiting a second click. */
  @state() private confirming?: string;

  /** The member the project is about to be handed to, awaiting a second click. */
  @state() private handingTo?: string;

  /** Members including those hidden, so a guest can be brought back. */
  @state() private pastMembers: Member[] = [];

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

      .gone {
        opacity: 0.55;
      }

      .confirm {
        font-size: 12px;
        color: var(--error-color, #db4437);
      }

      .remove.danger {
        color: var(--error-color, #db4437);
        font-weight: 700;
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
    const admin = this.isAdmin(member);

    // Ticking somebody in or out is managing the members — unless the somebody
    // is you, on your way out.
    const isMe = member !== undefined && member.id === this.meId;
    const mayToggle = this.mayManage || isMe;

    return html`
      <div class="row">
        <input
          type="checkbox"
          .checked=${member !== undefined}
          ?disabled=${admin || !mayToggle || this.busy !== undefined}
          title=${admin ? this.localize("admin_locked") : ""}
          @change=${() => this.toggleAccount(user, member)}
        />
        <!--
          Seeded on the member, never on the account: an automatic colour is
          derived from the member id everywhere else — expense rows, balances,
          statistics — so seeding it here on the Home Assistant account gave the
          same person two different colours. An account not in the group has no
          member to seed on yet, and its colour is only a preview until it does.
        -->
        ${this.renderTintable(member, user.name, member?.id ?? user.id)}
        <span class="name">${user.name}</span>
        ${admin
          ? html`<span class="tag">${this.localize("role_admin")}</span>`
          : nothing}
        ${this.renderHandOver(member, admin)}
      </div>
      ${this.renderPalette(member)}
    `;
  }

  /**
   * Hand the project to somebody else, who becomes its admin.
   *
   * The admin's alone, and offered only on an account that is in the project
   * and can log in: a member without one would hold every right nobody can
   * exercise, and the backend refuses it — so the panel does not ask.
   *
   * Confirmed once, because it cannot be taken back by the person doing it: you
   * become an ordinary member, and only the new admin can hand it on again.
   */
  private renderHandOver(member: Member | undefined, admin: boolean) {
    if (this.role !== "admin" || !member || admin) {
      return nothing;
    }

    if (this.handingTo === member.id) {
      return html`
        <se-button
          variant="text"
          class="danger"
          ?disabled=${this.busy !== undefined}
          @click=${() => this.handOver(member)}
        >
          ${this.localize("confirm_delete")}
        </se-button>
      `;
    }

    return html`
      <se-button
        variant="text"
        ?disabled=${this.busy !== undefined}
        title=${this.localize("confirm_make_admin")}
        @click=${() => this.handOver(member)}
      >
        ${this.localize("make_admin")}
      </se-button>
    `;
  }

  private async handOver(member: Member) {
    if (this.handingTo !== member.id) {
      this.handingTo = member.id;
      return;
    }

    this.busy = member.id;
    this.error = undefined;
    this.handingTo = undefined;

    try {
      await this.api.transferAdmin(this.groupId, member.id);

      // You are an ordinary member now, and nothing here is yours any more: the
      // page has to hear about it rather than keep offering what it last knew.
      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  }

  /**
   * A member's avatar, clickable to recolour them.
   *
   * The avatar is what the colour actually shows up in, so it is the obvious
   * thing to press. Members with no account yet have nothing to recolour.
   *
   * Your own colour is always yours. Somebody else's is managing the members,
   * and where the project does not allow it the avatar is a plain circle: a
   * palette that opened and then refused to save would read as a broken panel
   * rather than as a shut door.
   */
  private renderTintable(member: Member | undefined, name: string, seed: string) {
    const color = member?.color ?? colorFor(seed);
    const mayTint = member && (member.id === this.meId || this.mayManage);

    if (!member || !mayTint) {
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
      await this.api.updateMember(this.groupId, member.id, { color });

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
    const active = this.members.filter((member) => member.user_id === null);
    const hidden = this.pastMembers.filter(
      (member) =>
        member.user_id === null && !active.some((one) => one.id === member.id),
    );

    return html`
      <div class="section">
        <h3>${translate("guests")}</h3>
        <div class="muted">${translate("guests_hint")}</div>

        ${active.map(
          (member) => html`
            <div class="row">
              ${this.renderTintable(member, member.name, member.id)}
              <span class="name">${member.name}</span>
              ${this.confirming === member.id
                ? html`<span class="confirm">${translate("confirm_remove")}</span>`
                : nothing}
              <!--
                A guest has no account, so they are never you: removing one is
                always managing the members, and the project has to allow it.
              -->
              ${this.mayManage
                ? html`<button
                    class=${`remove ${this.confirming === member.id ? "danger" : ""}`}
                    ?disabled=${this.busy !== undefined}
                    aria-label=${translate("remove_member")}
                    @click=${() => this.removeGuest(member)}
                  >
                    ×
                  </button>`
                : nothing}
            </div>
            ${this.renderPalette(member)}
          `,
        )}

        ${hidden.map(
          (member) => html`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${member.color ?? colorFor(member.id)}`}
              >
                ${initials(member.name)}
              </div>
              <span class="name">${member.name}</span>
              ${this.mayManage
                ? html`<se-button
                    variant="text"
                    ?disabled=${this.busy !== undefined}
                    @click=${() => this.restoreGuest(member)}
                  >
                    ${translate("restore_member")}
                  </se-button>`
                : nothing}
            </div>
          `,
        )}
        ${this.mayManage
          ? html`<div class="add">
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
            </div>`
          : nothing}
      </div>
    `;
  }

  private memberForUser(userId: string): Member | undefined {
    return this.members.find((member) => member.user_id === userId);
  }

  /**
   * The admin stays: the backend refuses to let them out of their own group.
   *
   * Handing it on is the way out, and it is offered on every other row.
   */
  private isAdmin(member: Member | undefined): boolean {
    if (!member) {
      return false;
    }

    return this.memberships.some(
      (membership) =>
        membership.member_id === member.id &&
        membership.left_at === null &&
        membership.role === "admin",
    );
  }

  private async load() {
    this.error = undefined;

    try {
      const [haUsers, members, pastMembers, memberships] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, true),
        this.api.listMemberships(this.groupId),
      ]);

      this.haUsers = haUsers;
      this.members = members;
      this.pastMembers = pastMembers;
      this.memberships = memberships;
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.loading = false;
    }
  }

  private async toggleAccount(user: HaUser, member: Member | undefined) {
    // Taking someone out costs them access to the group: ask once.
    if (member && this.confirming !== member.id) {
      this.confirming = member.id;
      this.requestUpdate();
      return;
    }

    this.busy = user.id;
    this.error = undefined;
    this.confirming = undefined;

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
    if (this.confirming !== member.id) {
      this.confirming = member.id;
      return;
    }

    this.busy = member.id;
    this.error = undefined;
    this.confirming = undefined;

    try {
      // Hidden, not deleted: their past expenses stay attributable, and they
      // can be brought back.
      await this.api.removeMemberFromGroup(this.groupId, member.id);

      this.dirty = true;
      await this.load();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }
  }

  /** Bring a hidden guest back: they were never deleted, only set aside. */
  private async restoreGuest(member: Member) {
    this.busy = member.id;
    this.error = undefined;

    try {
      await this.api.addMemberToGroup(this.groupId, member.id);

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
