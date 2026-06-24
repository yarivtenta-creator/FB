# HOW_TO_START — Broker AI OS v5

A separate, safe instance on **port 6700**. Your existing system on 3023 is not touched.

## 1. Installation
1. Install Node.js 18+ (https://nodejs.org). Confirm: `node -v`.
2. Put the `BROKER_AI_OS_V5` folder anywhere (e.g. your Desktop).
3. First run installs dependencies automatically (Express only).

## 2. Startup
- Double-click **START_BROKER_AI_OS_V5.bat**, or run it from CMD.
- It verifies Node, installs deps if needed, sets safe env
  (`EXECUTION_MODE=manual`, `AUTO_RESUME=false`), starts the server, and opens
  your browser to http://localhost:6700.
- You can also use the **Broker AI OS V5.url** shortcut once the server is running.

## 3. Ports
- v5 uses **6700**. Your existing system keeps **3023**. They do not conflict.

## 4. Health panel location
- The dashboard at http://localhost:6700 shows **System Health** (11 checks),
  **Alpaca Accounts** (A/B status only), **Paper Signal Board**, **Approval Queue**,
  **T4 Futures (mock)**, and **n8n Registry**.
- Buttons **Test Connection** / **Run Full System Health Check** only re-run checks.
  They never restart engines, place orders, or touch credentials.

## 5. Troubleshooting
- **Port 6700 in use:** run STOP_BROKER_AI_OS_V5.bat, or change `set PORT_V5=` in the START .bat.
- **"Node not found":** install Node 18+ and reopen CMD so PATH refreshes.
- **Browser opened before server ready:** refresh after a second or two.
- **Blank panels:** check the CMD window for errors; ensure `db/` JSON files are present.

## 6. Safe shutdown
- Close the server CMD window, or run **STOP_BROKER_AI_OS_V5.bat** (kills only the
  6700 listener; leaves 3023 alone). **RESTART** does stop+start+reopen.

## Safety notes
- Mock data only. Not connected to the 3023 system or any broker.
- Execution mode defaults to `manual`; there is no live mode.
- Approval actions change status only — they never place orders.
