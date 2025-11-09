# AT Protocol Tools

GUI for DIDs.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Featuring](#featuring)
  * [DID Lookup](#did-lookup)
  * [Update `alsoKnownAs`](#update-alsoknownas)
- [How It Works](#how-it-works)
- [Develop](#develop)
- [Etc](#etc)

<!-- tocstop -->

</details>

## Featuring

### DID Lookup

Fetch the DID record by handle or DID string. Displays The DID document as JSON.

-----

### Update `alsoKnownAs`

Add records to the `alsoKnownAs` field in the DID record. This is useful for
things like [@ngerakines.me](https://bsky.app/profile/ngerakines.me)'s nice
tools [atwork.place](https://atwork.place/) and
[Weather Vane](https://verify.aviary.domains/), another site where you
can lookup a DID record and check cryptographic signatures.

* GitHub profiles
* Personal websites
* Other platforms


## How It Works

API calls are made directly from the browser to the pds using the
[@atproto/api](https://www.npmjs.com/package/@atproto/api) client library.

## Develop

Start a local dev server.

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## OAuth

After the oauth part, they will forward you to a URL like this:

```
https://atbox.dev/callback#state=GKXFyh...&iss=https%3A%2F%2Fbsky.social&code=cod-e627b3f8...
```

## Etc

- **Framework**: Preact with `htm`
- **State**: `@preact/signals`
- **AT Protocol**: `@atproto/api`
