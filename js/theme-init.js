/* Applies the saved theme before first paint (blocking, ~200 bytes). */
(function () {
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      root.setAttribute("data-theme", stored);
    } else {
      root.removeAttribute("data-theme");
    }
  } catch (e) {
    /* storage blocked — fall back to prefers-color-scheme */
  }
})();
