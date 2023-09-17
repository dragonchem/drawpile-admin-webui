import { ApiBase, ApiHttpError, ApiMethod, ApiResponse } from "../api";

export type WebadminServerStatusResponse = {
  started: string;
  sessions: number;
  maxSessions: number;
  users: number;
  ext_host: string;
  ext_port: number;
};

export type WebadminServerSettingsResponse = {
  allowGuestHosts?: boolean,
  allowGuests?: boolean,
  archive?: boolean,
  autoResetThreshold?: number,
  clientTimeout?: number,
  customAvatars?: boolean,
  extAuthAvatars?: boolean,
  extauthfallback?: boolean,
  extauthgroup?: string,
  extauthhost?: boolean,
  extauthkey?: string,
  extauthmod?: boolean,
  forceNsfm?: boolean,
  idleTimeLimit?: number,
  logpurgedays?: number,
  persistence?: boolean,
  privateUserList?: boolean,
  reporttoken?: string,
  serverTitle?: string,
  sessionCountLimit?: number,
  sessionSizeLimit?: number,
  welcomeMessage?: string
}

export class WebadminApi extends ApiBase {
  readonly baseUrl: string;
  private readonly auth: string;

  constructor(baseUrl: string, auth: string) {
    super();
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.auth = auth;
  }

  private async request<T>(
    path: string,
    method: ApiMethod,
    body?: object,
  ): Promise<ApiResponse<T>> {
    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Basic ${this.auth}`);

    const options: RequestInit = { method, headers, credentials: "omit" };
    if (body) {
      headers.set("Content-Type", "application/json");
      options.body = JSON.stringify(body);
    }

    const requestTimestamp = Date.now();
    const res = await fetch(`${this.baseUrl}${path}`, options);
    if (res.status >= 200 && res.status <= 299) {
      return new ApiResponse<T>(
        requestTimestamp,
        Date.now(),
        JSON.parse(await res.text()),
      );
    } else {
      const err = await ApiHttpError.create(res);
      return Promise.reject(err);
    }
  }
  
  async getStatus(): Promise<ApiResponse<WebadminServerStatusResponse>> {
    return this.request("/status", "GET");
  }
  
  async getSettings(): Promise<ApiResponse<WebadminServerSettingsResponse>> {
    return this.request("/server", "GET");
  }

  async patchSettings(settings: WebadminServerSettingsResponse) {
    const promise = this.request<WebadminServerSettingsResponse>("/server", "PUT", settings);
    this.setSuccess(promise, 'Saved succesfully.');
    return promise;
  }

  private setSuccess(promise: Promise<ApiResponse<any>>, message: string) {
    promise.then(() => {
      window.dispatchEvent(new CustomEvent('webapi-success', { detail: message }));
    });
  }
}
