# Operator Guide — Provider Setup Center

The Provider Setup Center (dashboard card **2**) lists every provider with quick links and a
read-only Test button.

## What each button does
- **Website** — opens the provider's site (new tab).
- **API Keys** — opens the provider's key/console page so you create keys *there*.
- **Docs** — opens the provider's API documentation.
- **Setup Guide** — opens the relevant operator guide in this repo.
- **Test** — calls `POST /api/data/providers/:id/test`. This is a **read-only connectivity probe**.
  - In `DATA_MODE=mock`: no network call at all (simulated, `reachable:false`).
  - In `DATA_MODE=live` + configured: a read-only probe is permitted. Still no orders, ever.

## What the Setup Center will NEVER do
- It never has a field that sends your API key to this server.
- You enter keys on the provider's own site, then place them in your local `.env`.
- `configured` reflects only whether the env var is **present** — never its value.

## Enabling a provider
A provider stays `enabled:false` until an operator has manually wired and verified it. Enabling is
deliberate and out of scope for the read-only data phase; data still flows as mock until then.
</content>
