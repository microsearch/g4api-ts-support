# g4api-ts-support

Support tools for [g4api-ts](https://github.com/microsearch/g4api-ts).

## importing g4api-ts-support

I've set up g4api-ts-suport so that you can import it directly from GitHub. At
some point, we may set up a local NPM repository using AWS CodeArtifact. For
now, I put it on GitHub so we don't have to deal with CodeCommit credentials.
Also, I'm not sure if NPM supports importing git projects from anything other
than GitHub and local storage.

Once, you've set up your node or browser project you can add g4api-ts to its
dependencies using:

    npm install --save github:microsearch/g4api-ts-support#v1.0.0

to get a specific version of the API or

    npm install --save github:microsearch/g4api-ts-support

if you want to live on the edge.

## error handling

Handling errors from a REST API can be complicated. Errors can come from a
number of different sources and figuring out exactly what happened is not always
straighforward. The `getG4ApiError` function will analyze the exception thrown
and returns a `G4ApiError` object which tells you what error occurred and where
it came from.

The following script demonstrates its use:

```typescript
#!/usr/bin/env ts-node

import * as g4 from "g4api-ts";
import { getG4ApiError } from "g4api-ts-support";

const baseURL = "https://g4-dev.v1.mrcapi.net";

async function authenticate(): Promise<g4.UserAuthenticationResponse> {
  try {
    const g4auth = new g4.Auth({ baseURL });
    const response = (
      await g4auth.authCreate({
        username: "bender",
        password: "meatbag",
      })
    ).data;
    return response;
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
    process.exit(1);
  }
}

(async () => {
  console.log("\nnetwork error\n---");
  try {
    const g4auth = new g4.Auth({ baseURL: "https://bogus-url.xyzzy" });
    const response = (
      await g4auth.authCreate({
        username: "bender",
        password: "meatbag",
      })
    ).data;
    console.log(response);
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
  }

  console.log("\nhttp error - unauthenticated request\n---");
  try {
    const g4user = new g4.User({
      baseURL,
      headers: { authorization: "bearer not-a-valid-token" },
    });
    const response = (await g4user.userDetail(1)).data;
    console.log(response);
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
  }

  console.log("\nsuccessful call\n---");
  try {
    const auth = await authenticate();
    const g4user = new g4.User({
      baseURL,
      headers: { authorization: `bearer ${auth.bearer}`, "x-g4-tenant": "nso" },
    });
    const response = (await g4user.userDetail(1)).data;
    console.log(response);
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
  }

  console.log("\ng4 error - invalid user id\n---");
  try {
    const auth = await authenticate();
    const g4user = new g4.User({
      baseURL,
      headers: { authorization: `bearer ${auth.bearer}`, "x-g4-tenant": "nso" },
    });
    const response = (await g4user.userDetail(1_000_000)).data;
    console.log(response);
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
  }

  console.log("\nasp.net error - validation error\n---");
  try {
    const auth = await authenticate();
    const g4user = new g4.User({
      baseURL,
      headers: { authorization: `bearer ${auth.bearer}` },
    });
    const response = (await g4user.userDetail(1)).data;
    console.log(response);
  } catch (error: unknown) {
    console.log(getG4ApiError(error));
  }
})();
```
