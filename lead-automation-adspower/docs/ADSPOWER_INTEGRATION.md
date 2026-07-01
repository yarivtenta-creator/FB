# AdsPower Integration Guide

## What is AdsPower?

AdsPower is a browser profile manager used for managing multiple browser identities.
This integration allows you to open and close AdsPower browser profiles directly
from the lead detail page, enabling streamlined manual outreach workflows.

## Default State

AdsPower is **disabled by default**.
The application runs fully without AdsPower.
No errors occur when AdsPower is not running.

## Setup

1. Install AdsPower: https://www.adspower.com/download
2. Open AdsPower and ensure it is running
3. Find your API Key in AdsPower → Settings → API
4. In the SDR app, go to **AdsPower Settings**
5. Enable the toggle
6. Enter your API Key
7. Click **Test Connection**

## Configuration

| Setting | Default | Notes |
|---|---|---|
| ADSPOWER_ENABLED | false | Must explicitly enable |
| ADSPOWER_BASE_URL | http://local.adspower.net:50325 | Standard local port |
| ADSPOWER_API_KEY | (empty) | From AdsPower Settings → API |
| ADSPOWER_API_VERSION | v2 | Current API version |
| ADSPOWER_AUTOMATION_ALLOWED | false | Never changed by the app |

## Workflow

### Attach a Profile to a Lead
1. Open lead detail page
2. Go to **AdsPower** tab
3. Select a profile from the dropdown (fetched live from AdsPower)
4. Click **Attach Profile**
5. Profile is linked to the lead in the database

### Open a Browser Profile
1. On lead detail → AdsPower tab
2. Find the attached profile
3. Click **Open**
4. AdsPower opens the browser profile
5. Action is logged to activity feed

### Close a Browser Profile
1. On lead detail → AdsPower tab
2. Click **Close** next to the open profile

## Safety Rules

| Rule | Status |
|---|---|
| No automatic messaging | Enforced |
| No automatic posting | Enforced |
| No automatic scraping | Enforced |
| No profile creation via app | Enforced |
| No profile deletion via app | Enforced |
| All actions logged | Enforced |
| User must click to trigger any action | Enforced |

## API Calls Made

| Call | When | Purpose |
|---|---|---|
| `GET /api/v2/user/list` | Settings test, profile dropdown | List profiles |
| `GET /api/v2/browser/start?user_id=X` | User clicks Open | Open browser |
| `GET /api/v2/browser/stop?user_id=X` | User clicks Close | Close browser |

No write operations are made to AdsPower. No profiles are created or modified.

## Troubleshooting

| Problem | Solution |
|---|---|
| "Disconnected" on test | Ensure AdsPower is running and accessible |
| No profiles shown | Check API Key is correct |
| "Disabled" message | Enable AdsPower in Settings |
| Port 50325 refused | Check AdsPower Local API is enabled in AdsPower settings |
