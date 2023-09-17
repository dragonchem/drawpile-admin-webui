
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ApiResponse } from "../api";
import { DrawpileElement, RenderResult } from "../element";
import { killEvent } from "../util";
import { WebadminApi, WebadminServerSettingsResponse } from "./api";

@customElement("webadmin-server-appearance")
export class WebadminServerAppearance extends DrawpileElement {
    @property() apiBaseUrl!: string;
    @state() api: WebadminApi | null = null;
    @state() error?: string;
    @state() serverTitle: string = '';
    @state() welcomeMessage: string = '';
    @state() publicUserList: boolean = false;
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
        this.serverTitle = settings.result.serverTitle ? settings.result.serverTitle : '';
        this.welcomeMessage = settings.result.welcomeMessage ? settings.result.welcomeMessage : '';
        this.publicUserList = settings.result.privateUserList !== undefined ? !settings.result.privateUserList : true;
        console.log(settings.result.privateUserList, this.publicUserList)
    }

    private submit(e: Event) {
        killEvent(e);
        this.submitting = true;
        this.api?.patchSettings({
            serverTitle: this.serverTitle,
            welcomeMessage: this.welcomeMessage,
            privateUserList: !this.publicUserList
        })
            .then(settings => this.settingsCallback(settings))
            .catch((reason: any) => {
                this.errorMessage = this.api?.getErrorMessage(reason);
                this.submitting = true;
            });
    }

    override render(): RenderResult {
        const submitDisabled =
          this.serverTitle.trim() === "" ||
          this.submitting
            ? "disabled"
            : nothing;
        return html`
            <form @submit="${this.submit}">
                <label for="serverTitle">
                    Server Title
                </label>
                <input
                    .value=${this.serverTitle}
                    @change="${this.bindInput("serverTitle")}"
                    @keyup="${this.bindInput("serverTitle")}"
                    readonly="${this.submitting || nothing}"
                    aria-invalid="${this.invalidInputs || nothing}"
                    type="text"
                    id="serverTitle"
                    name="serverTitle"
                    required
                    autofocus
                />
                <label for="welcomeMessage">
                    Welcome Message
                </label>
                <textarea
                    .value=${this.welcomeMessage}
                    @change="${this.bindInput("welcomeMessage")}"
                    @keyup="${this.bindInput("welcomeMessage")}"
                    readonly="${this.submitting || nothing}"
                    aria-invalid="${this.invalidInputs || nothing}"
                    type="text"
                    id="welcomeMessage"
                    name="welcomeMessage"
                ></textarea>
                <label for="publicUserList">
                    Include list of users in session announcement
                </label>
                <input
                    .checked=${this.publicUserList}
                    @change="${this.bindCheckbox("publicUserList")}"
                    readonly="${this.submitting || nothing}"
                    aria-invalid="${this.invalidInputs || nothing}"
                    type="checkbox"
                    id="publicUserList"
                    name="publicUserList"
                />
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