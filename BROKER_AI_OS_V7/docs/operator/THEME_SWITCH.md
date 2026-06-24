# Operator Guide — Switch Theme (Bright / Dark)

The dashboard supports a **bright** and a **dark** theme.

## Switch
- Click the **☀ Bright / ☾ Dark** button in the header (top right, next to the user).

## Persistence
- Your choice is saved in the browser via `localStorage` key `bk2024_theme`.
- It is reapplied automatically on every reload and on every dashboard page.
- This is a local browser preference only — nothing is sent to the server, no secrets involved.

## Implementation
- Palettes are defined in `public/index.html` under `[data-theme="dark"]` and `[data-theme="light"]`.
- Toggle logic lives in `public/theme.js` (`window.BK_THEME.toggle()`).
- Default is **dark** when no preference is saved.
</content>
