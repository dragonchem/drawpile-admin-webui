import { ApiBase, ApiHttpError, ApiMethod, ApiResponse } from "../api";

export class WebadminApi extends ApiBase {
  readonly baseUrl: string;
  private readonly auth: string;

  constructor(baseUrl: string, auth: string) {
    super();
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.auth = auth;
    console.log(this.baseUrl);
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
}
