/**
 * SpendWise – Pre-render Theme Initialization (SEC-09)
 * Synchronously applies the persisted theme ("light" or "dark") before DOM rendering
 * to prevent Flash of Unstyled Content (FOUC).
 */
(function () {
  try {
    var savedTheme = localStorage.getItem("spendwise_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  } catch (e) {}
})();

