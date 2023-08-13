import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DrawpilePageElement, RenderResult } from "../element";
import { Router } from "../router";
import { WebadminApi } from "./api";
import './api';
import './login';

@customElement("webadmin-index")
export class WebadminIndex extends DrawpilePageElement {
  static readonly pages = Object.freeze([
    // "/server",
    // "/sessions",
    // "/hostbans",
    // "/roles",
    // "/users",
    // "/changepassword",
  ]);

  @property() apibaseurl!: string;
  @state() api: WebadminApi | null = null;
  @state() wantLogout: boolean = false;
  targetPath?: string;

  private login(e: CustomEvent): void {
    // const detail = e.detail as LoginEventDetail;
    // this.api = detail.api;
    // this.rootResponse = detail.rootResponse;
    // this.wantLogout = false;
    // if (this.targetPath) {
    //   Router.push(`/listserver${this.targetPath}`);
    //   delete this.targetPath;
    // } else {
    //   Router.push(`/listserver${WebadminIndex.pages[0]}`);
    // }
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
            console.log(this.api)
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
    console.log(this.path)
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
    return html`test`;
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
}
