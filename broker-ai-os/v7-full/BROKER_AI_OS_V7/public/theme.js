/* theme.js — bright/dark theme for Broker AI OS v2.
 * Persists the operator's choice in localStorage ('bk2024_theme'). No network, no secrets.
 * Palettes are applied via the [data-theme] attribute on <html> (see index.html CSS). */
(function(){
  'use strict';
  var KEY = 'bk2024_theme';
  var THEMES = { dark:'dark', light:'light' };

  function saved(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }
  function persist(t){ try { localStorage.setItem(KEY, t); } catch(e){} }

  function apply(t){
    var theme = THEMES[t] ? t : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀ Bright' : '☾ Dark';
    return theme;
  }

  function current(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }

  function toggle(){
    var next = current() === 'dark' ? 'light' : 'dark';
    persist(next);
    return apply(next);
  }

  // Initialise as early as possible (default dark; respect saved preference).
  // Runs in <head> before the toggle button exists, so the attribute is set now…
  apply(saved() || 'dark');
  // …and we re-apply once the DOM is ready so the toggle button LABEL syncs too.
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ apply(current()); });
  } else {
    apply(current());
  }

  window.BK_THEME = { apply: apply, toggle: toggle, current: current };
})();
