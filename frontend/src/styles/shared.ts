import { css } from "lit";

/**
 * Shared styles.
 *
 * Everything is expressed with Home Assistant theme variables so that the
 * panel follows the user's theme, per ADR-006.
 */
export const sharedStyles = css`
  :host {
    --se-gap: 16px;
    --se-radius: 12px;
    --se-positive: var(--success-color, #0f9d58);
    --se-negative: var(--error-color, #db4437);
  }

  * {
    box-sizing: border-box;
  }

  .card {
    background: var(--card-background-color, #fff);
    border-radius: var(--se-radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.08));
    overflow: hidden;
  }

  /*
   * A currency picker slotted into an amount field, where the code used to be
   * merely written. It has to pass for part of that field rather than a control
   * parked alongside: no frame, no fill, and the muted colour a written suffix
   * had. A number and its unit are one thing.
   */
  .currency {
    background: none;
    border: none;
    outline: none;
    color: var(--secondary-text-color);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
  }

  .currency:focus-visible {
    color: var(--primary-color, #03a9f4);
  }

  /*
   * A button that asks to be read as a link: "+ add a description", "see all",
   * "try again". Always a button, never an anchor — it goes nowhere.
   */
  .link {
    background: none;
    border: none;
    color: var(--primary-color, #03a9f4);
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }

  /*
   * Two fields per row where they fit; one per row when the screen is narrow.
   *
   * minmax(0, …) rather than 1fr: a bare 1fr keeps an automatic minimum of the
   * content's own width, and a date input asks for more than half a phone. The
   * column would grow to grant it and take the dialog with it.
   */
  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }

  @media (max-width: 380px) {
    .pair {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--se-gap);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .spacer {
    flex: 1;
  }

  h1,
  h2,
  h3 {
    margin: 0;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  h1 {
    font-size: 22px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 15px;
  }

  .muted {
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  .positive {
    color: var(--se-positive);
  }

  .negative {
    color: var(--se-negative);
  }

  .amount {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    flex: 0 0 auto;
  }

  .empty {
    padding: 40px 24px;
    text-align: center;
    color: var(--secondary-text-color);
  }

  .error {
    background: var(--error-color, #db4437);
    color: #fff;
    padding: 12px 16px;
    border-radius: var(--se-radius);
    font-size: 14px;
  }

  /*
   * What is about to happen, spelled out before it does. Outlined rather than
   * filled like .error: nothing has gone wrong yet, and it must not be mistaken
   * for something that has.
   */
  .warning {
    border: 1px solid var(--error-color, #db4437);
    color: var(--error-color, #db4437);
    padding: 12px 16px;
    border-radius: var(--se-radius);
    font-size: 14px;
  }

  button {
    font-family: inherit;
  }
`;
