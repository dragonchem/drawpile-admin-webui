
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ApiResponse } from "../../api";
import { DrawpileElement, RenderResult } from "../../element";
import { WebadminApi, WebadminServerSettingsResponse } from "../api";

@customElement("webadmin-server-authentication")
export class WebadminServerAuthentication extends DrawpileElement {
    @property() apiBaseUrl!: string;
    @state() api: WebadminApi | null = null;
    @state() settings?: ApiResponse<WebadminServerSettingsResponse>;
    @state() loading = false;
    @state() error?: string;
    @state() serverTitle: string = '';
    @state() welcomeMessage: string = '';

    override connectedCallback(): void {
        super.connectedCallback();
        this.getSettings();
    }

    private getSettings() {
        this.loading = true;
        this.api?.getSettings().then(settings => {
            this.loading = false;
            this.settings = settings;
        }).catch((reason) => {
            this.loading = false;
            this.error = reason;
        });
    }

    override render(): RenderResult {
        return html`
            ${JSON.stringify(this.settings)}
        `;
    }
}