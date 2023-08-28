
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, property, state } from "lit/decorators.js";
import { DrawpilePageElement, RenderResult } from "../element";
import { Router } from '../router';
import { nothing } from 'lit';
import { WebadminApi } from './api';
import './server-status'

@customElement("webadmin-server")
export class WebadminServer extends DrawpilePageElement {
    static readonly pages = Object.freeze([
      "/status",
      // "/sessions",
      // "/hostbans",
      // "/roles",
      // "/users",
      // "/changepassword",
    ]);
    @property() apiBaseUrl!: string;
    @state() api: WebadminApi | null = null;
    targetPath?: string;

    protected override checkPath(): void {
        console.log(this.path);
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
              console.log(this.api)
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
      console.log(this.path)
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
        ${this.renderPage(prefix, rest)}
      `;
    }

    private renderPage(prefix: string, rest: string): RenderResult {
      const elementName = `webadmin-server-${prefix.replace('/', '')}`;
      return html`
        <${unsafeStatic(elementName)}
          .api=${this.api}
          path="${rest}"
        ></${unsafeStatic(elementName)}>
      `;
    }
}