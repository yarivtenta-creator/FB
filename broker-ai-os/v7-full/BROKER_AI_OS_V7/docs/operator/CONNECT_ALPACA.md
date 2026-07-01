# Operator Guide — Connect Alpaca (READ-ONLY, manual)

Alpaca is wired for **read-only market data only**. There is no order/execution path.

## Step 1 — get keys (on Alpaca's site, never in this app)
1. Open the Provider Setup Center card on the dashboard → Alpaca → **API Keys** link.
2. Create / copy your keys in the Alpaca dashboard. Use **paper / data** keys.

## Step 2 — put keys in your LOCAL .env (never committed)
1. Copy `.env.example` to `.env` (the real `.env` is git-ignored).
2. Fill:
   ```
   DATA_MODE=live
   ALPACA_API_KEY_ID=your_id_here
   ALPACA_API_SECRET_KEY=your_secret_here
   ALPACA_DATA_BASE_URL=https://data.alpaca.markets
   ```
3. Save. The app reads only the *presence* of these keys (`configured:true`); it never
   logs or displays the value.

## Step 3 — restart and verify
1. Restart the server so it re-reads env.
2. On the dashboard, Alpaca should show `configured`.
3. Click **Test** under Alpaca — this is a **read-only** probe. It never places an order.

## Safety
- Even with `DATA_MODE=live`, the Alpaca adapter exposes only quotes/bars/status/positions.
- No `placeOrder/submitOrder/cancelOrder/closePosition/replaceOrder/transfer/execute` exists.
- To go back to fully offline mode, set `DATA_MODE=mock` (or remove the keys).
</content>
