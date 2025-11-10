# AT Protocol Tools

GUI for DIDs.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Featuring](#featuring)
  * [DID Lookup](#did-lookup)
  * [Update `alsoKnownAs`](#update-alsoknownas)
- [How It Works](#how-it-works)
- [Develop](#develop)
- [OAuth](#oauth)
  * [Local OAuth](#local-oauth)
- [Etc](#etc)
- [See also](#see-also)

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

### Local OAuth

Oauth is hard to test...

I have been using `ngrok`:

#### Use ngrok locally

```sh
ngrok http https://localhost:8888
```

Then in a different terminal, start the localhost dev server:

```sh
npm start
```

#### Generate a self-signed certificate

And you need to generate some certifacates:

```
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

And add this to `vite.config.js`:

```js

{
  // ...

  server: {
      https: {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem')
      },
      port: 8888,
      host: 'atbox.test',
      open: true,
      proxy: {
          '/api': {
              target: 'http://localhost:9999/.netlify/functions',
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, ''),
          },
      },
  }
}
```


-------

## Etc

- **Framework**: Preact with `htm`
- **State**: `@preact/signals`
- **AT Protocol**: `@atproto/api`

## See also

* [atwork.place](https://atwork.place/)
* [Weather Vane](https://verify.aviary.domains/)
