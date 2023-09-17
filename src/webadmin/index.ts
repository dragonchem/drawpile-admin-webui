import { nothing } from "lit";
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, property, state } from "lit/decorators.js";
import { DrawpilePageElement, RenderResult } from "../element";
import { Router } from "../router";
import { WebadminApi, WebadminServerStatusResponse } from "./api";
import { ApiResponse, LoginEventDetail } from "../api";
import './api';
import './login';
import './server';
import './navlink';

@customElement("webadmin-index")
export class WebadminIndex extends DrawpilePageElement {
  static readonly pages = Object.freeze([
    "/server",
    // "/sessions",
    // "/hostbans",
    // "/roles",
    // "/users",
    // "/changepassword",
  ]);

  @property() apibaseurl!: string;
  @state() api: WebadminApi | null = null;
  @state() wantLogout: boolean = false;
  @state() statusResponse?: ApiResponse<WebadminServerStatusResponse>;
  targetPath?: string;

  private login(e: CustomEvent): void {
    const detail = e.detail as LoginEventDetail;
    this.api = detail.api as WebadminApi;
    this.statusResponse = detail.rootResponse;
    this.wantLogout = false;
    if (this.targetPath) {
      Router.push(`/webadmin${this.targetPath}`);
      delete this.targetPath;
    } else {
      Router.push(`/webadmin${WebadminIndex.pages[0]}`);
    }
  }

  protected override checkPath(): void {
    Router.dispatch(
      this.path,
      [
        WebadminIndex.pages,
        (): void => {
          if (!this.api) {
            this.targetPath = this.path;
            Router.replace("/webadmin/login");
          }
        },
      ],
      ["/login", null],
      [
        null,
        () => {
          if (this.api) {
            Router.replace(`/webadmin${WebadminIndex.pages[0]}`);
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
        WebadminIndex.pages,
        (prefix: string, rest: string): RenderResult => {
          if (this.api) {
            return this.renderMain(prefix, rest);
          } else {
            return nothing;
          }
        },
      ],
      ["/login", this.renderLogin.bind(this)],
      [null, (): RenderResult => nothing],
    );
  }

  private renderMain(prefix: string, rest: string) {
    return html`
    <main class="container">
      <article>
        <header>
          <hgroup>
            <h1>Web admin</h1>
          </hgroup>
          <div class="grid">
          <webadmin-navlink
            path="${this.path}"
            href="/server"
            label="Server"
          ></webadmin-navlink>
          </div>
        </header>
        ${this.renderPage(prefix, rest)}
      </article>
    </main>
    `;
  }

  private renderLogin(): RenderResult {
    return html`
      <main class="container">
        <webadmin-login
          apibaseurl="${this.apibaseurl}"
          wantlogout="${this.wantLogout || nothing}"
          @login="${this.login}"
        ></webadmin-login>
      </main>
    `;
  }

  private renderPage(prefix: string, rest: string): RenderResult {
    const elementName = `webadmin-${prefix.replace('/', '')}`;
    return html`
      <${unsafeStatic(elementName)}
        .api=${this.api}
        path=${rest}
      ></${unsafeStatic(elementName)}>
    `;
  }
}
