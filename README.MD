# g4api-ts-support

Support tools for [g4-api-ts](https://github.com/microsearch/g4api-ts).

## importing g4api-ts-support

I've set up g4api-ts-suport so that you can import it directly from GitHub. At
some point, we may set up a local NPM repository using AWS CodeArtifact. For
now, I put it on GitHub so we don't have to deal with CodeCommit credentials.
Also, I'm not sure if NPM supports importing git projects from anything other
than GitHub and local storage.

Once, you've set up your node or browser project you can add g4api-ts to its
dependencies using:

    npm install --save https://github.com/microsearch/g4api-ts-support/tarball/v1.0.0

to get a specific version of the API or

    npm install --save https://github.com/microsearch/g4api-ts-support

if you want to live on the edge.

NB: If you want to update the version of g4api-ts-support you're using later,
you need to delete the `node_modules` directory before running `npm install`.
NPM does seem to track the version when using this import method.
