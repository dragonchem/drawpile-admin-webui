import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ApiResponse } from "../../api";
import { DrawpileElement, RenderResult } from "../../element";
import { killEvent } from "../../util";
import { WebadminApi, WebadminServerSettingsResponse } from "../api";

@customElement("webadmin-server-connections")
export class WebadminServerConnections extends DrawpileElement {
  @property() apiBaseUrl!: string;
  @state() api: WebadminApi | null = null;
  @state() error?: string;
  @state() clientTimeout: number = 0;
  @state() allowGuests: boolean = false;
  @state() allowGuestHosts: boolean = false;
  @state() logpurgedays: number = 0;
  @state() sessionSizeLimit: number = 0;
  @state() sessionCountLimit: number = 0;
  @state() autoResetThreshold: number = 0;
  @state() idleTimeLimit: number = 0;
  @state() persistence: boolean = false;
  @state() archive: boolean = false;
  @state() customAvatars: boolean = false;
  @state() submitting: boolean = false;
  @state() errorMessage: string | undefined = "";
  @state() invalidInputs: boolean = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.getSettings();
  }

  private getSettings() {
    this.submitting = true;
    this.api
      ?.getSettings()
      .then((settings) => this.settingsCallback(settings))
      .catch((reason) => {
        this.submitting = false;
        this.error = reason;
      });
  }

  private settingsCallback(
    settings: ApiResponse<WebadminServerSettingsResponse>
  ) {
    this.submitting = false;

    this.clientTimeout = settings.result.clientTimeout ?? 0;
    this.allowGuests = settings.result.allowGuests ?? false;
    this.allowGuestHosts = settings.result.allowGuestHosts ?? false;
    this.logpurgedays = settings.result.logpurgedays ?? 0;
  }

  private submit(e: Event) {
    killEvent(e);
    this.api
      ?.patchSettings({
        clientTimeout: this.clientTimeout,
        allowGuests: this.allowGuests,
        allowGuestHosts: this.allowGuestHosts,
        logpurgedays: this.logpurgedays,
      })
      .then((settings) => this.settingsCallback(settings))
      .catch((reason: any) => {
        this.errorMessage = this.api?.getErrorMessage(reason);
      });
  }

  override render(): RenderResult {
    const submitDisabled = this.submitting ? "disabled" : nothing;
    return html`
      <form @submit="${this.submit}">
        <label for="serverTitle"> Client Timeout </label>
        <multi-format-number-input
            initialValue=${this.clientTimeout}
            @change="${this.bindMultiFormatNumberInput("clientTimeout")}"
            readonly="${this.submitting || nothing}"
            invalid="${this.invalidInputs || nothing}"
            min="0"
            formats='[{"label":"Seconds","weight":1},{"label":"Minutes","weight":60},{"label":"Hours","weight":3600},{"label":"Unlimited","weight":0}]'
        ></multi-format-number-input>
        <label for="allowGuests"> Allow guests </label>
        <input
          .checked=${this.allowGuests}
          @change="${this.bindCheckbox("allowGuests")}"
          readonly="${this.submitting || nothing}"
          aria-invalid="${this.invalidInputs || nothing}"
          type="checkbox"
          id="allowGuests"
          name="allowGuests"
        />
        <br />
        <br />
        <label for="allowGuestHosts"> Allow anyone to host sessions </label>
        <br />
        <input
          .checked=${this.allowGuestHosts}
          @change="${this.bindCheckbox("allowGuestHosts")}"
          readonly="${this.submitting || nothing}"
          aria-invalid="${this.invalidInputs || nothing}"
          type="checkbox"
          id="allowGuestHosts"
          name="allowGuestHosts"
        />
        <br />
        <br />
        <label for="serverTitle"> Delete server logs after </label>
        <multi-format-number-input
            initialValue=${this.logpurgedays}
            @change="${this.bindMultiFormatNumberInput("logpurgedays")}"
            readonly="${this.submitting || nothing}"
            invalid="${this.invalidInputs || nothing}"
            min="0"
            max="365"
            formats='[{"label":"Days","weight":1},{"label":"Unlimited","weight":0}]'
        ></multi-format-number-input>
        <br />
        <p class="error">${this.errorMessage}</p>
        <button
          type="submit"
          aria-busy="${this.submitting ? "true" : nothing}"
          disabled="${submitDisabled}"
        >
          ${this.submitting ? "Saving…" : "Save"}
        </button>
      </form>
    `;
  }
}
