
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, property, state } from "lit/decorators.js";
import { DrawpilePageElement, RenderResult } from "../element";
import { Router } from '../router';
import { nothing } from 'lit';
import { WebadminApi } from './api';
import './server/server-status'
import './server/server-appearance'
import './server/server-connections'
import './server/server-authentication'

@customElement("webadmin-server")
export class WebadminServer extends DrawpilePageElement {
    static readonly pages = Object.freeze([
      "/status",
      "/appearance",
      "/connections",
      "/authentication"
    ]);
    @property() apiBaseUrl!: string;
    @state() api: WebadminApi | null = null;
    @property() success: boolean = false;
    @property() successMessage: string = '';
    targetPath?: string;

    override connectedCallback(): void {
      super.connectedCallback();
      window.addEventListener('webapi-success', (e: Event) => this.handleStateUpdated(e as CustomEvent))
    }

    private handleStateUpdated(e: CustomEvent) {
      this.success = true;
      this.successMessage = e.detail;
      setTimeout(() => {
        this.closeSucces();
      }, 5000);
    }

    closeSucces() {
      this.success = false;
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
    }

    protected override checkPath(): void {
      Router.dispatch(
        this.path,
        [
            WebadminServer.pages,
          (): void => {
            if (!this.api) {
              this.targetPath = this.path;
              Router.replace("/webadmin/login");
            }
          },
        ],
        [
          null,
          () => {
            if (this.api) {
              Router.replace(`/webadmin/server${WebadminServer.pages[0]}`);
            } else {
              Router.replace("/webadmin/login");
            }
          },
        ],
      );
    }

    override render(): RenderResult {
      return Router.dispatch(
        this.path,
        [
            WebadminServer.pages,
          (prefix: string, rest: string): RenderResult => {
            if (this.api) {
              return this.renderMain(prefix, rest);
            } else {
              return nothing;
            }
          },
        ],
        [null, (): RenderResult => nothing],
      );
    }

    private renderMain(prefix: string, rest: string) {
      return html`
        <webadmin-navlink
          path="${this.path}"
          href="/status"
          label="Status"
        ></webadmin-navlink>
        <webadmin-navlink
          path="${this.path}"
          href="/appearance"
          label="Appearance"
        ></webadmin-navlink>
        <webadmin-navlink
          path="${this.path}"
          href="/connections"
          label="Connections"
        ></webadmin-navlink>
        <br/>
        ${this.renderPage(prefix, rest)}
        <div class="popup" style="${this.success ? 'opacity: 100' : 'opacity: 0'}">
          ${this.successMessage}
          <span @click=${this.closeSucces}>x</span>
        </div>
      `;
    }

    private renderPage(prefix: string, rest: string): RenderResult {
      const elementName = `webadmin-server-${prefix.replace('/', '')}`;
      return html`
        <br/>
        <${unsafeStatic(elementName)}
          .api=${this.api}
          path="${rest}"
        ></${unsafeStatic(elementName)}>
      `;
    }
}