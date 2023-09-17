
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ApiResponse } from "../api";
import { DrawpileElement, RenderResult } from "../element";
import { killEvent } from "../util";
import { WebadminApi, WebadminServerSettingsResponse } from "./api";

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
        this.api?.getSettings()
            .then(settings => this.settingsCallback(settings))
            .catch((reason) => {
                this.submitting = false;
                this.error = reason;
            });
    }

    private settingsCallback(settings: ApiResponse<WebadminServerSettingsResponse>) {
        this.submitting = false;
    }

    private submit(e: Event) {
        killEvent(e);
        this.api?.patchSettings({
        })
            .then(settings => this.settingsCallback(settings))
            .catch((reason: any) => {
                this.errorMessage = this.api?.getErrorMessage(reason);
            });
    }

    override render(): RenderResult {
        const submitDisabled =
          this.submitting
            ? "disabled"
            : nothing;
        return html`
            <form @submit="${this.submit}">
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