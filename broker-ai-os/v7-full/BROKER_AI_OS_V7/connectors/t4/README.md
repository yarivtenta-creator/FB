# T4 / Plus500 Connector (MOCK)

Data-only mock. Serves static futures quotes (ES, NQ, YM, RTY, CL, GC, SI, ZN).

- No order routing. No account connection. No credentials.
- `t4_mock_connector.js` exposes `getQuotes()`, `getSymbolMap()`, `status()` — all read-only.
- `status()` returns `mock` (never `connected`), because there is no real connection.

Future real integration MUST keep order routing OUT of this module and behind the
Manual Approval Layer. See SAFETY_RULES.md.
