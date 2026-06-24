# T4 Connector — Safety Rules

1. This connector is DATA-ONLY. It must never place, route, or simulate orders.
2. No credentials, API keys, or account identifiers belong in this folder.
3. Any future live data feed must be read-only and rate-limited.
4. Any future order capability must live elsewhere and pass through the Manual
   Approval Layer with a human click. It must never be added to this module.
5. Default and only status while mock: `mock` or `not_configured`.
