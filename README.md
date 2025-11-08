# AT Protocol Tools

A web interface for managing your AT Protocol DID and identity. This site provides user-friendly access to the features from the [@substrate-system/at](https://github.com/substrate-system/at) CLI tool.

## Features

### DID Lookup
Fetch and view the DID document for any AT Protocol handle or DID string. See:
- `alsoKnownAs` entries
- Verification methods
- Service endpoints (like PDS servers)

### Update alsoKnownAs
Link external identities to your Bluesky DID document. Add URLs like:
- GitHub profiles
- Personal websites
- Other platforms

## How It Works

All API calls are made directly from the browser using the [@atproto/api](https://www.npmjs.com/package/@atproto/api) client library. No server-side processing is required - your credentials are sent directly to your PDS and never stored.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The dev server runs on port 8888 (Vite) with Netlify Functions on port 9999.

## Tech Stack

- **Framework**: Preact with htm
- **State Management**: @preact/signals
- **Routing**: @substrate-system/routes
- **AT Protocol**: @atproto/api
- **Build Tool**: Vite
- **Styling**: CSS with nesting

## About

This project provides a web interface for the [AT Protocol CLI tool](https://github.com/substrate-system/at), making it easier to interact with AT Protocol DID documents without using the command line.

## License

SEE LICENSE IN LICENSE
