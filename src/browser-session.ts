import * as g4 from "g4api-ts";

export { G4BrowserSession, G4SessionOptions };

// Since session tokens expire in 15 minutes, setting the refresh interval to
// just under 5 minutes gives us 3 attempts to refresh the session token before
// we can no longer talk to the server.
const REFRESH_INTERVAL = 4.75 * 60 * 1000; // ms
const REQUEST_TIMEOUT = 30 * 1000; // ms

type G4SessionOptions = {
  stage: "prod" | "dev" | "test";
  tenant?: string;
  application?: string;
};

class G4BrowserSession {
  constructor(options: G4SessionOptions) {
    this.config = {
      baseURL: `https://g4-${options.stage}.v1.mrcapi.net`,
      headers: {
        "x-g4-tenants": options.tenant ?? undefined,
        "x-g4-application": options.application ?? undefined,
      },
      timeout: REQUEST_TIMEOUT,
    };
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
    this.applyBearer(response.bearer!);
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
        this.applyBearer(response.bearer);
        this.saveSession();
      }
    } catch {
      this.authentication = null;
      this.saveSession();
    }
  }

  get admin() {
    return new g4.Admin(this.config);
  }
  get admins() {
    return new g4.Admins(this.config);
  }
  get auth() {
    return new g4.Auth(this.config);
  }
  get collections() {
    return new g4.Collections(this.config);
  }
  get document() {
    return new g4.Document(this.config);
  }
  get documents() {
    return new g4.Documents(this.config);
  }
  get exportUsers() {
    return new g4.ExportUsers(this.config);
  }
  get importUsers() {
    return new g4.ImportUsers(this.config);
  }
  get password() {
    return new g4.Password(this.config);
  }
  get policy() {
    return new g4.Policy(this.config);
  }
  get profile() {
    return new g4.Profile(this.config);
  }
  get profileMetadata() {
    return new g4.ProfileMetadata(this.config);
  }
  get profiles() {
    return new g4.Profiles(this.config);
  }
  get role() {
    return new g4.Role(this.config);
  }
  get roleMetadata() {
    return new g4.RoleMetadata(this.config);
  }
  get roles() {
    return new g4.Roles(this.config);
  }
  get session() {
    return new g4.Session(this.config);
  }
  get sync() {
    return new g4.Sync(this.config);
  }
  get tenant() {
    return new g4.Tenant(this.config);
  }
  get tenantMetadata() {
    return new g4.TenantMetadata(this.config);
  }
  get tenants() {
    return new g4.Tenants(this.config);
  }
  get user() {
    return new g4.User(this.config);
  }
  get userClaim() {
    return new g4.UserClaim(this.config);
  }
  get userClaimTokens() {
    return new g4.UserClaimTokens(this.config);
  }
  get userDetails() {
    return new g4.UserDetails(this.config);
  }
  get userEvents() {
    return new g4.UserEvents(this.config);
  }
  get userImport() {
    return new g4.UserImport(this.config);
  }
  get userMetadata() {
    return new g4.UserMetadata(this.config);
  }
  get userPassword() {
    return new g4.UserPassword(this.config);
  }
  get userResetTokens() {
    return new g4.UserResetTokens(this.config);
  }
  get users() {
    return new g4.Users(this.config);
  }

  private syncRefresh() {
    (async () => await this.refresh())();
  }

  private applyBearer(bearer: string | null) {
    this.config.headers["authorization"] =
      bearer !== null ? `bearer ${bearer}` : undefined;
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

  private config: g4.ApiConfig;
  private localStorageKey: string;
  private interval: number | null = null;
  private authentication: g4.UserAuthenticationResponse | null = null;
}
