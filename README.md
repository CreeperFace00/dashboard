# Netdata Agent v1 Dashboard (Community Fork)

A community-maintained fork of the original Netdata Agent v1 React dashboard, with all Netdata Cloud integration removed. This fork keeps the dashboard fully self-contained and independent of Netdata's cloud services.

> **AI Disclaimer:** The initial cloud-removal refactor in this fork was performed with the assistance of Claude (Anthropic), an AI coding assistant. All changes have been reviewed for correctness, but users should audit the code for their own security and compliance requirements.

---

## What Was Changed

The following Netdata Cloud features have been removed from the original source:

**UI elements removed:**
- "Connection to Cloud" status indicator (ACLK)
- "Sign in" button and all authentication iframes
- "Discover the free benefits of Netdata Cloud" banner and navigation tabs
- Spaces / Space Panel iframes (cloud account panel in the left sidebar)
- Cloud migration manager and modal (prompts to migrate to cloud)

**Code removed:**
- All cloud-specific Redux state: `cloudBaseURL`, `isCloudEnabled`, `isCloudAvailable`, `isAgentClaimed`, `isACLKAvailable`
- Posthog analytics and Google Tag Manager injection (these sent usage telemetry to Netdata's servers)
- Sign-in/sign-out saga flows and related localStorage sync
- `cloud-settings.ts` (set cloud-specific window globals)
- All cloud-gating conditionals throughout the component tree

**Build fixes for modern environments:**
- Added `@netdata/react-filter-box` stub (the original private package was removed from npm)
- Replaced `node-sass` (incompatible with Node.js 18+) with `sass`
- Moved `react`, `react-dom`, and `styled-components` from `peerDependencies` to `dependencies`
- Added `npm overrides` entry to resolve the missing private package

The core monitoring dashboard — charts, alarms, the registry, pan/zoom, theming, snapshots, and all chart libraries — is unchanged.

---

## Installing on a Netdata Agent

Netdata's built-in web server serves static files from its web root (typically `/usr/share/netdata/web/`). The v1 dashboard's `index.html` is loaded from the `v1/` subdirectory, while the JavaScript and CSS chunks are served from `static/` in the web root.

### 1. Build the dashboard

Clone this repo and build:

```bash
git clone <this-repo> netdata-dashboard
cd netdata-dashboard
npm install --legacy-peer-deps
rm -rf node_modules/node-sass   # incompatible with Node.js 18+
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

> **Requirements:** Node.js 18 or later, npm 8 or later.
> The `NODE_OPTIONS` flag is required because this project uses webpack 4, which has an OpenSSL compatibility issue with Node.js 17+.

### 2. Deploy to the agent

```bash
# Copy the new index.html into the v1 directory
sudo cp build/index.html /usr/share/netdata/web/v1/index.html

# Copy the static JS/CSS chunks into the web root
# (Content-hashed filenames mean this won't break any other deployed version)
sudo cp -r build/static/* /usr/share/netdata/web/static/
```

### 3. Open the dashboard

Navigate to your Netdata agent's v1 dashboard:

```
http://YOUR-AGENT-HOST:19999/v1/
```

Or if you have HTTPS configured:

```
https://YOUR-AGENT-HOST:19999/v1/
```

No restart of the Netdata agent is required — the web server serves files directly from disk.

---

## Finding Your Web Root

If Netdata is not installed at the default path, find the web root with:

```bash
grep -r "web = " /etc/netdata/netdata.conf
# or
netdatacli config 2>/dev/null | grep "web ="
```

Common locations:
| Installation method | Web root |
|---|---|
| Package manager (apt/yum/pacman) | `/usr/share/netdata/web` |
| Kickstart script | `/usr/share/netdata/web` |
| Docker | `/usr/share/netdata/web` (inside the container) |
| Manual/source build | `/opt/netdata/usr/share/netdata/web` |

---

## Development

Start the dev server (requires Netdata running at `localhost:19999`):

```bash
npm install --legacy-peer-deps
rm -rf node_modules/node-sass
NODE_OPTIONS=--openssl-legacy-provider npm run start:dashboard
```

If your Netdata agent is on a remote host, tunnel it first:

```bash
ssh -L 127.0.0.1:19999:127.0.0.1:19999 your-server
```

### Other dev commands

```bash
# Run tests
npm test

# Build for production
NODE_OPTIONS=--openssl-legacy-provider npm run build

# Start node-view component in isolation
NODE_OPTIONS=--openssl-legacy-provider npm run start:node-view

# Start custom dashboards (tv.html) in dev mode
NODE_OPTIONS=--openssl-legacy-provider npm run start:tv
```

### Run a single test file

```bash
npx react-scripts test --testPathPattern=<path> --watchAll=false
```

---

## Project Structure

This is a React + Redux application. State lives in `src/domains/` organized by domain:

- **`global/`** — app-wide state: theme, pan/zoom, alarms, registry, window focus
- **`chart/`** — per-chart data fetching, rendering, and attribute management
- **`dashboard/`** — layout, sidebar, node-view, snapshot state

Charts are rendered through `src/domains/chart/components/chart-container/` using one of several libraries depending on chart type: **Dygraphs** (time series), **D3**, **EasyPieChart**, **GaugeJS**, or **Peity**.

See `CLAUDE.md` for full architecture details.

---

## Credits

- Original dashboard: [netdata/dashboard](https://github.com/netdata/dashboard) — Copyright Netdata Inc., ISC License
- This fork removes Netdata Cloud integration and is maintained independently of Netdata Inc.
