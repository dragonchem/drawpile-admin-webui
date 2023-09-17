
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ApiResponse } from "../api";
import { DrawpileElement, RenderResult } from "../element";
import { WebadminApi, WebadminServerStatusResponse } from "./api";

@customElement("webadmin-server-status")
export class WebadminServerStatus extends DrawpileElement {
    @property() apiBaseUrl!: string;
    @state() api: WebadminApi | null = null;
    @state() status?: ApiResponse<WebadminServerStatusResponse>;
    @state() loading = false;
    @state() error?: string;
    private interval?: number;

    override connectedCallback(): void {
        super.connectedCallback();
        this.getStatus();
        this.interval = setInterval(() => {
            this.getStatus();
        }, 5000);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.interval) clearInterval(this.interval);
    }

    private getStatus() {
        this.loading = true;
        this.api?.getStatus().then(status => {
            this.loading = false;
            this.status = status;
        }).catch((reason) => {
            this.loading = false;
            this.error = reason;
        });
    }

    override render(): RenderResult {
        return html`
            ${this.error ? `<p>${this.error}</p>` : ''}
            Host: ${this.status?.result?.ext_host}
            <br/>
            Port: ${this.status?.result?.ext_port}
            <br/>
            Max sessions: ${this.status?.result?.maxSessions}
            <br/>
            Started on: ${this.status?.result?.started}
            <br/>
            Current users: ${this.status?.result?.users}
            <br/>
            <button
                @click=${this.getStatus}
                aria-busy="${this.loading ? "true" : nothing}"
                ${this.loading ? 'disabled' : ''}
            >
                ${this.loading ? "Refreshing..." : "Refresh"}
            </button>
        `;
    }
}