import * as g4 from "g4api-ts";

export { G4ApiOptions, G4Api };

type G4ApiOptions = {
  baseURL: string;
  tenant?: string;
  application?: string;
};

const DEFAULT_REQUEST_TIMEOUT = 30 * 1000; // ms

class G4Api {
  constructor(options: G4ApiOptions) {
    this.config = {
      baseURL: options.baseURL,
      headers: {
        "x-g4-tenants": options.tenant ?? undefined,
        "x-g4-application": options.application ?? undefined,
      },
      timeout: DEFAULT_REQUEST_TIMEOUT,
    };
  }

  set bearer(bearer: string) {
    this.config.headers["authorization"] = `bearer ${bearer}`;
  }

  set apikey(apikey: string) {
    this.config.headers["authorization"] = `apikey ${apikey}`;
  }

  // set timeout in seconds
  set timeout(timeout: number) {
    this.config.timeout = timeout * 1000;
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

  private config: g4.ApiConfig;
}
