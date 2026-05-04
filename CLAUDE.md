# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Netdata Agent v1 Dashboard — a React-based monitoring dashboard. It ships as both a standalone web app and an npm package (`@netdata/dashboard`). It is deprecated but still maintained.

## Commands

```bash
npm run start:dashboard   # dev server on localhost:3000 (requires Netdata at localhost:19999)
npm run start:node-view   # node-view component dev server
npm run start:tv          # custom dashboards static dev mode
npm run build             # production bundle
npm test                  # Jest (non-interactive)
npm run ts-bundle         # compile TypeScript to lib/ (used for npm package publishing)
npm run to-cloud          # ts-bundle then copy lib/ to ../cloud-frontend/node_modules/@netdata/dashboard/
```

Run a single test file:
```bash
npx react-scripts test --testPathPattern=<path> --watchAll=false
```

The `npm run lint` script is intentionally empty — no linter is wired up.

The dev server proxies API calls to `localhost:19999`. If Netdata is on a remote host, SSH tunnel first:
```bash
ssh -L 127.0.0.1:19999:127.0.0.1:19999 NODE
```

## Code Style

- Prettier: 2-space indent, 100 char lines, no semicolons
- ESLint: TypeScript + React Hooks + Testing Library rules
- TypeScript: ES2018 target, no strict mode, `declaration: true`

## Architecture

### Three Build Targets

| Entry Point | Purpose |
|---|---|
| `src/index.tsx` | Main dashboard web app |
| `src/node-view-app.tsx` | Node-view embedded component |
| `src/custom-dashboards-app.tsx` | Static custom dashboards |
| `src/index-npm.ts` | npm library exports |

### Domain-Driven Redux Structure

State lives in `src/domains/`, each domain following the pattern:
- `actions.ts` — redux-act action creators
- `reducer.ts` — redux-act reducer
- `selectors.ts` — reselect selectors
- `sagas.ts` / `sagas/` — redux-saga side effects
- `components/` — domain-scoped UI
- `hooks/` — domain-scoped React hooks

**global** — app-wide state: theme, pan/zoom, alarms, registry, window focus, Netdata hello/info API calls  
**chart** — individual chart data fetching, rendering, selection, and attribute management  
**dashboard** — dashboard layout, sidebar, node-view, custom dashboard state, URL hash sync  
**charts** — (separate from `chart`) chart metadata registry  

### Chart Rendering Pipeline

```
ChartContainer (domains/chart/components/chart-container/)
  └── chart-with-loader.tsx   # fetches data via fetchDataAction saga, manages poll clock
        └── AbstractChart     # dispatches to the correct lib-chart by ChartLibraryName
              └── lib-charts/ # dygraph, easypiechart, gauge, sparkline, d3pie, peity, google, textonly, groupbox
```

Charts are configured via `data-*` HTML attributes on the container element — `transformDataAttributes.ts` parses them into a typed `Attributes` object. `chartLibrariesSettings.ts` maps each `ChartLibraryName` to its format, options, and pixel-per-point config.

### Redux Context Separation

When built as an npm package (for embedding in Netdata Cloud), the store uses a **separate React context** (`dashboardReduxContext`) so it doesn't collide with the host app's Redux store. This is controlled by `REACT_APP_SHOULD_USE_DEFAULT_CONTEXT`: set to `true` for standalone builds, unset for npm/embedded builds. All hooks (`useSelector`, `useDispatch`) in `store/redux-separate-context.ts` are context-aware.

### Path Aliases (via craco)

```
@/src            → ./src
utils            → ./src/utils
components       → ./src/components
domains          → ./src/domains
store            → ./src/store
types            → ./src/types
hooks            → ./src/hooks
fonts            → ./src/fonts
styles           → ./src/styles
vendor           → ./src/vendor
services         → ./src/services
dynamic-imports  → ./src/dynamic-imports
```

### Hybrid Codebase

`src/App.tsx` is ~5000 lines and is the main layout/portal orchestrator. `dashboard.js`, `main.js`, and `dashboard_info.js` in `src/` are large pre-React legacy files — avoid modifying them unless necessary. New feature code lives in `src/domains/`.

### Netdata API Coupling

The app is tightly coupled to Netdata's agent HTTP API (served at the agent's origin, typically port 19999) and the legacy `window.NETDATA` global. The `global` domain sagas handle the `/api/v1/hello` and `/api/v1/info` handshake on startup. Chart data flows through `fetchDataAction` / `fetchChartAction` sagas in `domains/chart/sagas.ts`, which calls `/api/v1/data` and `/api/v1/chart` respectively.
