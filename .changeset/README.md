# Changesets

Every PR that changes what consumers see (new component, prop change,
bug fix, token change) needs a changeset:

```bash
npm run changeset
```

This asks for a bump type (patch/minor/major — see the versioning note in
the root README) and a one-line summary, then writes a markdown file
here describing the change. Commit that file with the PR.

On merge to `main`, CI runs `changeset version` to consume every pending
changeset into a version bump + `CHANGELOG.md` entry, then
`changeset publish` to push the new version to npm.

Docs: https://github.com/changesets/changesets
