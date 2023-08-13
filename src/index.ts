// SPDX-License-Identifier: MIT
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DrawpileElement, RenderResult } from "./element";
import { Router } from "./router";
import "./listserver";
import "./webadmin";
import "./page-controls";
import "./top-bar";

@customElement("drawpile-webui")
export class DrawpileWebui extends DrawpileElement {
  @property() logo!: string;
  @property() listserver!: string;
  @property() webadmin!: string;
  @state() path!: string;
  @state() subpath!: string;

  constructor() {
    super();
    Router.init(this.routeChanged.bind(this));
  }

  routeChanged(path: string) {
    console.log(path);
    Router.dispatch(
      path,
      [
        "/listserver",
        (rest: string): void => {
          this.path = "listserver";
          this.subpath = rest;
        },
      ],
      [
        "/webadmin",
        (rest: string): void => {
          this.path = "webadmin";
          this.subpath = rest;
        },
      ],
      [
        null,
        (): void => {
          this.path = "unknown";
          this.subpath = "";
          Router.replace("/listserver");
        },
      ],
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override render(): RenderResult {
    return [html`<top-bar logo="${this.logo}"></top-bar>`, this.renderPath()];
  }

  renderPath(): RenderResult {
    if (this.path === "listserver") {
      return html`<listserver-index
        apibaseurl="${this.listserver}"
        path="${this.subpath}"
      ></listserver-index>`;
    } else if (this.path === "webadmin") {
      return html`<webadmin-index
        apibaseurl="${this.webadmin}"
        path="${this.subpath}"
      ></webadmin-index>`;
    } else {
      return nothing;
    }
  }
}
