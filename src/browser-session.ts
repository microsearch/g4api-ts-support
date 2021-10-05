import * as g4 from "g4api-ts";
import { G4Api, G4ApiOptions } from "./g4api";

export { G4BrowserSession };

// Since session tokens expire in 15 minutes, setting the refresh interval to
// just under 5 minutes gives us 3 attempts to refresh the session token before
// we can no longer talk to the server.
const REFRESH_INTERVAL = 4.75 * 60 * 1000; // ms

class G4BrowserSession extends G4Api {
  constructor(options: G4ApiOptions) {
    super(options);
    this.localStorageKey = `g4-${options.application ?? "app"}-session`;
    try {
      if (this.loadSession()) {
        this.interval = setInterval(() => this.syncRefresh(), REFRESH_INTERVAL);
      }
      this.syncRefresh();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      this.authentication = null;
    }
  }

  async connect(
    username: string,
    password: string
  ): Promise<g4.UserAuthenticationResponse> {
    if (this.connected()) {
      this.disconnect();
    }
    const response = (await this.auth.authCreate({ username, password })).data;
    this.bearer = response.bearer;
    this.authentication = response.accessAllowed ? { ...response } : null;
    if (this.connected()) {
      this.interval = setInterval(() => this.syncRefresh(), REFRESH_INTERVAL);
    }
    this.saveSession();
    return response;
  }

  disconnect() {
    if (this.connected()) {
      this.authentication = null;
      this.saveSession();
      clearInterval(this.interval!);
    }
  }

  connected() {
    return this.authentication !== null && this.authentication.bearer !== null;
  }

  async refresh() {
    try {
      if (this.authentication !== null) {
        const response = (await this.auth.authList()).data;
        this.authentication.username = response.username;
        this.authentication.claims = response.claims;
        this.authentication.bearer = response.bearer;
        this.bearer = response.bearer;
        this.saveSession();
      }
    } catch {
      this.authentication = null;
      this.saveSession();
    }
  }

  private syncRefresh() {
    (async () => await this.refresh())();
  }

  private loadSession() {
    const session = window.localStorage.getItem(this.localStorageKey);
    this.authentication = session === null ? null : JSON.parse(session);
    if (this.authentication === null) {
      window.localStorage.removeItem(this.localStorageKey);
    }
    return this.connected();
  }

  private saveSession() {
    if (this.connected()) {
      window.localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(this.authentication)
      );
    } else {
      window.localStorage.removeItem(this.localStorageKey);
    }
  }

  private localStorageKey: string;
  private interval: number | null = null;
  private authentication: g4.UserAuthenticationResponse | null = null;
}
