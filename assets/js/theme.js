/**
 * Dark/light mode toggle with localStorage persistence.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "lumen-theme";
  var root = document.documentElement;
  var button = document.querySelector("[data-theme-toggle]");

  function getPreferredTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    root.style.colorScheme = theme;
  }

  setTheme(getPreferredTheme());

  if (button) {
    button.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
})();
