/**
 * ==========================================================================
 * SpendWise – Personal Expense Tracker
 * Features: Dashboard, Transactions, Budget Management & Budget Pop-up Alerts
 * ==========================================================================
 * 
 * Topics Covered in this File:
 * 1. Single Page Navigation: Smooth switching between Dashboard, Transactions, and Budgets.
 * 2. State Management: Transactions, Overall Monthly Budget, Category Budgets.
 * 3. LocalStorage Persistence: Persisting transactions and budgets across reloads.
 * 4. Advanced Transaction Management:
 *    - Search, Filter (Type, Category), Sort (Newest, Oldest, Highest, Lowest).
 *    - In-place Edit and Delete with confirmation.
 * 5. Budget Management & Real-time Pop-up Alerts:
 *    - Overall Monthly Budget tracking for current calendar month.
 *    - Category-wise Budget tracking for current calendar month.
 *    - Professional custom modal pop-up when spending exceeds overall or category budgets.
 *    - Pop-up appears EVERY TIME an expense transaction is added or edited if budget is exceeded.
 *    - Dual-warning presentation when one expense exceeds both overall and category limits.
 */

// ==========================================================================
// 1. SELECT DOM ELEMENTS
// ==========================================================================

// Navigation Menu & Views
const navLinks = document.querySelectorAll(".nav-link");
const viewSections = document.querySelectorAll(".view-section");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");

// Transaction Form and Input Elements
const transactionForm = document.getElementById("transaction-form");
const formTitle = document.getElementById("form-title");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const submitBtn = document.getElementById("add-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// Financial Summary Displays (Summary Cards)
const totalBalanceDisplay = document.getElementById("total-balance");
const totalIncomeDisplay = document.getElementById("total-income");
const totalExpensesDisplay = document.getElementById("total-expenses");

// Search, Filter & Sort Controls
const searchInput = document.getElementById("search-input");
const filterTypeSelect = document.getElementById("filter-type");
const filterCategorySelect = document.getElementById("filter-category");
const sortBySelect = document.getElementById("sort-by");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const transactionList = document.getElementById("transaction-list");

// Overall Budget Elements (Dashboard & Budgets View)
const overallBudgetForm = document.getElementById("overall-budget-form");
const overallBudgetInput = document.getElementById("overall-budget-input");

// Dashboard View Overall Budget Elements
const dashOverallLimit = document.getElementById("dash-overall-limit");
const dashOverallSpent = document.getElementById("dash-overall-spent");
const dashOverallRemaining = document.getElementById("dash-overall-remaining");
const dashOverallPercent = document.getElementById("dash-overall-percent");
const dashOverallProgressBar = document.getElementById("dash-overall-progress-bar");
const dashOverallStatusBadge = document.getElementById("dash-overall-status-badge");
const dashCategoryPreviewList = document.getElementById("dash-category-preview-list");
const dashRecentPreviewList = document.getElementById("dash-recent-preview-list");

// Budgets View Overall Budget Elements
const budgetViewLimit = document.getElementById("budget-view-limit");
const budgetViewSpent = document.getElementById("budget-view-spent");
const budgetViewRemaining = document.getElementById("budget-view-remaining");
const budgetViewPercent = document.getElementById("budget-view-percent");
const budgetViewProgressBar = document.getElementById("budget-view-progress-bar");
const budgetViewStatusBadge = document.getElementById("budget-view-status-badge");

// Category Budget Form Elements
const categoryBudgetForm = document.getElementById("category-budget-form");
const categoryBudgetFormTitle = document.getElementById("category-budget-form-title");
const categoryBudgetSelect = document.getElementById("category-budget-select");
const categoryBudgetAmountInput = document.getElementById("category-budget-amount");
const saveCategoryBudgetBtn = document.getElementById("save-category-budget-btn");
const cancelCategoryBudgetBtn = document.getElementById("cancel-category-budget-btn");
const categoryBudgetsList = document.getElementById("category-budgets-list");

// Budget Alert Pop-up Modal Elements
const budgetAlertModal = document.getElementById("budget-alert-modal");
const budgetAlertsContainer = document.getElementById("budget-alerts-container");
const closeAlertModalBtn = document.getElementById("close-alert-modal-btn");
const ackAlertModalBtn = document.getElementById("ack-alert-modal-btn");

// Savings Goals Elements (Phase 4)
const goalForm = document.getElementById("goal-form");
const goalFormTitle = document.getElementById("goal-form-title");
const goalNameInput = document.getElementById("goal-name");
const goalTargetAmountInput = document.getElementById("goal-target-amount");
const goalSavedAmountInput = document.getElementById("goal-saved-amount");
const goalTargetDateInput = document.getElementById("goal-target-date");
const goalDescriptionInput = document.getElementById("goal-description");
const saveGoalBtn = document.getElementById("save-goal-btn");
const cancelGoalEditBtn = document.getElementById("cancel-goal-edit-btn");
const savingsGoalsList = document.getElementById("savings-goals-list");

// Savings Goals Overview Metrics Displays
const goalsTotalCountDisplay = document.getElementById("goals-total-count");
const goalsTotalTargetDisplay = document.getElementById("goals-total-target");
const goalsTotalSavedDisplay = document.getElementById("goals-total-saved");
const goalsCompletedCountDisplay = document.getElementById("goals-completed-count");

// Add Savings (Deposit) Modal Elements
const addSavingsModal = document.getElementById("add-savings-modal");
const addSavingsForm = document.getElementById("add-savings-form");
const depositGoalId = document.getElementById("deposit-goal-id");
const depositModalTitle = document.getElementById("add-savings-modal-title");
const depositAmountInput = document.getElementById("deposit-amount");
const depositCurrentSaved = document.getElementById("deposit-current-saved");
const depositTarget = document.getElementById("deposit-target");
const depositRemaining = document.getElementById("deposit-remaining");
const closeAddSavingsModalBtn = document.getElementById("close-add-savings-modal-btn");
const cancelDepositBtn = document.getElementById("cancel-deposit-btn");

// User Authentication DOM Elements (Phase 5)
const openAuthModalBtn = document.getElementById("open-auth-modal-btn");
const logoutBtn = document.getElementById("logout-btn");
const authLoggedOutBox = document.getElementById("auth-logged-out");
const authLoggedInBox = document.getElementById("auth-logged-in");
const userAvatarInitial = document.getElementById("user-avatar-initial");
const userDisplayName = document.getElementById("user-display-name");

const authModal = document.getElementById("auth-modal");
const closeAuthModalBtn = document.getElementById("close-auth-modal-btn");
const authTabLogin = document.getElementById("auth-tab-login");
const authTabRegister = document.getElementById("auth-tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const registerNameInput = document.getElementById("register-name");
const registerEmailInput = document.getElementById("register-email");
const registerPasswordInput = document.getElementById("register-password");
const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
const switchToRegisterLink = document.getElementById("switch-to-register-link");
const switchToLoginLink = document.getElementById("switch-to-login-link");
const authAlertBox = document.getElementById("auth-alert-box");
const authAlertText = document.getElementById("auth-alert-text");
const authAlertIcon = document.getElementById("auth-alert-icon");
const loginSubmitBtn = document.getElementById("login-submit-btn");
const registerSubmitBtn = document.getElementById("register-submit-btn");

// ==========================================================================
// 2. CONSTANTS & APPLICATION STATE
// ==========================================================================

// Backend API URL Resolution & Canonical Auth Keys (Phase 5, SEC-07, & SEC-FIND-01)
/**
 * Resolves and validates the backend API URL from window.SPENDWISE_CONFIG.
 * Supports an optional customUrl parameter for testing and validation.
 *
 * Validation rules:
 * 1. Must be a non-empty string and parse as a valid URL.
 * 2. Protocol must be http: or https:.
 * 3. Insecure HTTP (http:) is only permitted for localhost and 127.0.0.1.
 * 4. Non-local / production hosts must use HTTPS.
 * 5. Normalizes the pathname to ensure it ends with "/api" exactly once.
 * 6. Logs a clear error and returns null on invalid or missing configuration.
 *
 * @param {string} [customUrl] - Optional URL string for test validation.
 * @returns {string|null} - Normalized API base URL, or null if invalid.
 */
function resolveBackendApiUrl(customUrl) {
  const rawUrl = typeof customUrl === "string"
    ? customUrl.trim()
    : (typeof window !== "undefined" && window.SPENDWISE_CONFIG && typeof window.SPENDWISE_CONFIG.API_URL === "string"
        ? window.SPENDWISE_CONFIG.API_URL.trim()
        : null);

  if (!rawUrl) {
    console.error("❌ [SpendWise Config Error]: window.SPENDWISE_CONFIG.API_URL is missing or empty.");
    return null;
  }

  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.error(`❌ [SpendWise Config Error]: Invalid API URL protocol "${parsed.protocol}". Must be http: or https:.`);
      return null;
    }

    const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol === "http:" && !isLocalHost) {
      console.error(`❌ [SpendWise Config Error]: Insecure HTTP is only permitted for localhost and 127.0.0.1. Production API must use HTTPS ("${rawUrl}").`);
      return null;
    }

    let path = parsed.pathname.replace(/\/+$/, "");
    if (!path.endsWith("/api")) {
      path = path ? `${path}/api` : "/api";
    }

    return `${parsed.origin}${path}`;
  } catch (err) {
    console.error(`❌ [SpendWise Config Error]: Invalid API_URL format "${rawUrl}": ${err.message}`);
    return null;
  }
}

// Expose on window for runtime testing and validation
if (typeof window !== "undefined") {
  window.resolveBackendApiUrl = resolveBackendApiUrl;
}

const BACKEND_API_URL = resolveBackendApiUrl();

/**
 * Validates whether BACKEND_API_URL is properly configured.
 * Prevents requests from being constructed using a null or invalid URL (SEC-FIND-01).
 * @returns {boolean} True if BACKEND_API_URL is a non-empty string.
 */
function isBackendConfigured() {
  return typeof BACKEND_API_URL === "string" && BACKEND_API_URL.length > 0;
}

/**
 * Handles API configuration errors consistently across the application:
 * - Logs safe diagnostic information without exposing secrets.
 * - Displays a user-friendly error message via auth alert or modal alert.
 * 
 * @param {string} [actionDescription] - Action being attempted (e.g. "save transaction")
 */
function showConfigError(actionDescription) {
  const diagnostic = "SpendWise backend API URL is missing or invalid. Verify window.SPENDWISE_CONFIG.API_URL in config.js.";
  console.error(`❌ [SpendWise Config Error]: ${diagnostic}`);

  const userMessage = actionDescription
    ? `⚠️ Configuration Error: Cannot ${actionDescription}. The API server URL is not configured or invalid. Please check config.js.`
    : "⚠️ Configuration Error: The API server URL is not configured or invalid. Please check config.js.";

  if (typeof showAuthAlert === "function" && typeof authAlertBox !== "undefined" && authAlertBox) {
    showAuthAlert(userMessage);
  } else {
    alert(userMessage);
  }
}

if (typeof window !== "undefined") {
  window.isBackendConfigured = isBackendConfigured;
  window.showConfigError = showConfigError;
}
const LOCAL_STORAGE_AUTH_TOKEN_KEY = "spendwise_auth_token";
const LOCAL_STORAGE_USER_KEY = "spendwise_user_profile";
let currentUser = null;
let authToken = null;

// User-Scoped and Guest Storage Keys (SEC-07)
const LOCAL_STORAGE_ACTIVE_VIEW_KEY = "spendwise_active_view";
const LOCAL_STORAGE_THEME_KEY = "spendwise_theme";
let currentTheme = "light";

/**
 * Returns the currently active authenticated User ID or null
 */
function getActiveUserId() {
  const user = getCurrentUser();
  return user && (user.id || user._id) ? String(user.id || user._id) : null;
}

/**
 * User-Scoped Storage Key Generators (SEC-07)
 * Ensures authenticated data is isolated strictly by User ID:
 *   - Transactions: spendwise_tx_<userId>
 *   - Overall Budget: spendwise_overall_budget_<userId>
 *   - Category Budgets: spendwise_budgets_<userId>
 *   - Savings Goals: spendwise_goals_<userId>
 * Unauthenticated guests use designated guest keys.
 */
function getTxStorageKey(userId = getActiveUserId()) {
  return userId ? `spendwise_tx_${userId}` : "spendwise_guest_transactions";
}

function getOverallBudgetStorageKey(userId = getActiveUserId()) {
  return userId ? `spendwise_overall_budget_${userId}` : "spendwise_guest_overall_budget";
}

function getCategoryBudgetsStorageKey(userId = getActiveUserId()) {
  return userId ? `spendwise_budgets_${userId}` : "spendwise_guest_category_budgets";
}

function getGoalsStorageKey(userId = getActiveUserId()) {
  return userId ? `spendwise_goals_${userId}` : "spendwise_guest_savings_goals";
}

/**
 * Purges legacy unscoped and redundant storage keys to prevent cross-user pollution (SEC-07)
 */
function purgeLegacyStorageKeys() {
  try {
    const legacyKeys = [
      "spendwise_transactions",
      "spendwise_overall_budget",
      "spendwise_category_budgets",
      "spendwise_savings_goals",
      "spendwise_alerted_budgets",
      "token",
      "authToken",
      "user"
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.warn("Storage cleanup notice:", e);
  }
}

/**
 * Clears all authentication credentials and legacy auth keys from localStorage (SEC-07)
 */
function clearAuthStorage() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  } catch (e) {
    console.warn("Auth storage clear notice:", e);
  }
}

/**
 * Unified Authentication Helper (SEC-07)
 * Makes getAuthToken() the single source of truth for retrieving the JWT token.
 * Uses only the canonical 'spendwise_auth_token'.
 */
function getAuthToken() {
  if (authToken && typeof authToken === "string" && authToken.trim() !== "" && authToken !== "null" && authToken !== "undefined") {
    return authToken.trim();
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  if (stored && typeof stored === "string" && stored.trim() !== "" && stored !== "null" && stored !== "undefined") {
    authToken = stored.trim();
    return authToken;
  }
  return null;
}

/**
 * Retrieves the active User profile (SEC-07).
 * Reads strictly from memory or canonical LOCAL_STORAGE_USER_KEY.
 */
function getCurrentUser() {
  if (currentUser && typeof currentUser === "object" && (currentUser.id || currentUser._id)) {
    return currentUser;
  }
  const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (userJson) {
    try {
      const parsed = JSON.parse(userJson);
      if (parsed && (parsed.id || parsed._id)) {
        currentUser = {
          id: String(parsed.id || parsed._id),
          _id: String(parsed.id || parsed._id),
          name: parsed.name,
          email: parsed.email
        };
        return currentUser;
      }
    } catch (e) {
      currentUser = null;
    }
  }
  return null;
}

/**
 * Standardized API request headers helper with Bearer token (SEC-07).
 */
function getAuthHeaders(includeContentType = true) {
  const token = getAuthToken();
  const headers = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

let isHandlingAuthError = false;

/**
 * Centralized Session Expiry & 401 Handler (SEC-07)
 * Ensures consistent cleanup, prevents data leakage on session expiration,
 * and debounces duplicate alert notifications from concurrent API requests.
 */
function handleAuthError(message = "Access denied or session expired. Please log in.") {
  console.warn("🔒 Auth Error / Session Expired:", message);

  // 1. Clear active token & user profile from memory
  authToken = null;
  currentUser = null;

  // 2. Clear all authentication keys from persistent storage
  clearAuthStorage();

  // 3. Clear authenticated in-memory financial data immediately
  transactions = [];
  overallBudget = 0;
  categoryBudgets = [];
  savingsGoals = [];

  // 4. Load guest data (or blank state) and re-render all views
  loadAllData();

  // 5. Update auth UI to show logged-out state
  updateAuthUI();

  // 6. Stop inactivity tracking
  stopInactivityTimer();

  // 7. Debounce notification & modal prompt so multiple concurrent 401s don't stack alerts
  if (!isHandlingAuthError) {
    isHandlingAuthError = true;
    setTimeout(() => {
      isHandlingAuthError = false;
    }, 1500);

    alert(`⚠️ ${message}`);
    openAuthModal("login");
  }
}

// ==========================================================================
// INACTIVITY TIMEOUT ENGINE (SEC-07: 30-Minute Auto-Logout)
// ==========================================================================

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let inactivityTimer = null;
let lastActivityTimestamp = Date.now();

/**
 * Resets the 30-minute inactivity timer on valid user action
 */
function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  // Only track inactivity for logged-in authenticated users
  if (getAuthToken() && getCurrentUser()) {
    inactivityTimer = setTimeout(onInactivityTimeout, INACTIVITY_TIMEOUT_MS);
  }
}

/**
 * Stops the inactivity timer on logout
 */
function stopInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

/**
 * Callback when user is inactive for 30 minutes
 */
function onInactivityTimeout() {
  if (!getAuthToken()) return;
  console.warn("🔒 Inactivity timeout reached (30 minutes). Terminating session.");
  handleAuthError("You have been logged out due to 30 minutes of inactivity. Please log in again.");
}

/**
 * Throttled activity event listener
 */
function handleUserActivity() {
  const now = Date.now();
  // Throttle reset to at most once every 10 seconds to minimize CPU cycles
  if (now - lastActivityTimestamp > 10000) {
    lastActivityTimestamp = now;
    resetInactivityTimer();
  }
}

// Category Icons Mapping
const CATEGORY_ICONS = {
  "Food & Dining": "🍔",
  "Shopping": "🛍️",
  "Housing & Rent": "🏠",
  "Transportation": "🚗",
  "Utilities & Bills": "⚡",
  "Entertainment": "🎬",
  "Healthcare": "💊",
  "Salary / Wages": "💼",
  "Freelance & Consulting": "💻",
  "Investments & Dividends": "📈",
  "Gifts & Grants": "🎁",
  "Other Income": "💰",
  "Other Expense": "📦"
};

// Category Colors for Charts & Visuals
const CATEGORY_COLORS = {
  "Food & Dining": "#fd79a8",
  "Shopping": "#a29bfe",
  "Housing & Rent": "#6c5ce7",
  "Transportation": "#0984e3",
  "Utilities & Bills": "#00cec9",
  "Entertainment": "#fdcb6e",
  "Healthcare": "#e17055",
  "Salary / Wages": "#00b894",
  "Freelance & Consulting": "#20bf6b",
  "Investments & Dividends": "#4b7bec",
  "Gifts & Grants": "#a55eea",
  "Other Income": "#26de81",
  "Other Expense": "#778ca3"
};

/**
 * Safely retrieves a trusted static emoji icon for a financial category.
 * Prevents prototype pollution, HTML injection, and SVG injection from untrusted categories (SEC-08).
 * @param {string} category - Category name
 * @param {string} fallback - Safe fallback emoji
 * @returns {string} Trusted emoji icon string
 */
function getCategoryIcon(category, fallback = "🏷️") {
  if (typeof category === "string" && Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, category)) {
    return CATEGORY_ICONS[category];
  }
  return typeof fallback === "string" ? fallback : "🏷️";
}

/**
 * Safely retrieves a trusted hex color code for a financial category.
 * @param {string} category - Category name
 * @param {string} fallback - Safe fallback color
 * @returns {string} Safe color code
 */
function getCategoryColor(category, fallback = "#6c5ce7") {
  if (typeof category === "string" && Object.prototype.hasOwnProperty.call(CATEGORY_COLORS, category)) {
    return CATEGORY_COLORS[category];
  }
  return fallback;
}

// Application State Variables
let transactions = [];
let overallBudget = 0;
let categoryBudgets = [];
let savingsGoals = [];

// Edit tracking state
let editingTransactionId = null;
let editingCategoryBudgetId = null;
let editingGoalId = null;

// Reports & Analytics State
let currentReportPeriod = "month"; // "week", "month", "year", "all"
let currentChartGranularity = "weekly"; // "weekly", "monthly"
let incomeExpenseChartInstance = null;
let categoryChartInstance = null;

// ==========================================================================
// 2B. THEME ENGINE (Dark Mode / Light Mode)
// ==========================================================================

/**
 * Initializes the theme based on localStorage preference or defaults to "light".
 * Sets <html> data-theme attribute, class names, and button icon & title.
 */
function initTheme() {
  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || "light";
    applyTheme(savedTheme, false);
  } catch (e) {
    console.error("Error reading theme from localStorage:", e);
    applyTheme("light", false);
  }
}

/**
 * Applies the specified theme ("light" or "dark") to the document root and updates UI controls.
 * @param {string} theme - "light" or "dark"
 * @param {boolean} updateCharts - whether to re-render Chart.js instances if active
 */
function applyTheme(theme, updateCharts = true) {
  const activeTheme = theme === "dark" ? "dark" : "light";
  currentTheme = activeTheme;

  // Set data-theme attribute and dark-theme class on <html>
  document.documentElement.setAttribute("data-theme", activeTheme);
  if (activeTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }

  // Update theme toggle button icon & title tooltip
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const iconSpan = document.getElementById("theme-icon");
  if (iconSpan) {
    iconSpan.textContent = activeTheme === "dark" ? "☀️" : "🌙";
  }
  if (toggleBtn) {
    const titleText = activeTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    toggleBtn.setAttribute("title", titleText);
    toggleBtn.setAttribute("aria-label", titleText);
  }

  // Persist preference to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, activeTheme);
  } catch (e) {
    console.warn("Could not save theme preference to localStorage:", e);
  }

  // Re-render charts with appropriate theme colors if charts exist or reports view is visible
  if (updateCharts && typeof renderReports === "function") {
    const reportsView = document.getElementById("reports-view");
    if ((reportsView && reportsView.style.display !== "none") || incomeExpenseChartInstance || categoryChartInstance) {
      renderReports();
    }
  }
}

/**
 * Toggles between Light Mode and Dark Mode
 */
function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
}

/**
 * Attaches the click event listener to the theme toggle button
 */
function setupThemeListeners() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }
}

// ==========================================================================
// 3. INITIALIZATION & EVENT LISTENERS
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize and apply theme preference early
  initTheme();
  setupThemeListeners();

  // Set default date input in transaction form to today
  setDefaultDate();

  // Setup Navigation Menu listeners
  setupNavigation();

  // Setup Transaction Form listeners
  transactionForm.addEventListener("submit", handleTransactionFormSubmit);
  cancelEditBtn.addEventListener("click", cancelEditMode);

  // Setup Search, Filter, Sort listeners
  searchInput.addEventListener("input", renderTransactions);
  filterTypeSelect.addEventListener("change", renderTransactions);
  filterCategorySelect.addEventListener("change", renderTransactions);
  sortBySelect.addEventListener("change", renderTransactions);
  resetFiltersBtn.addEventListener("click", resetFilters);

  // Event delegation for Transaction actions (Edit & Delete - SEC-08 XSS-03)
  if (transactionList) {
    transactionList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (action === "edit-transaction") {
        startEditTransaction(id);
      } else if (action === "delete-transaction") {
        deleteTransaction(id);
      }
    });
  }

  // Category suggestion when switching transaction type
  typeSelect.addEventListener("change", (e) => {
    if (editingTransactionId === null) {
      if (e.target.value === "income") {
        categorySelect.value = "Salary / Wages";
      } else if (e.target.value === "expense") {
        categorySelect.value = "Food & Dining";
      }
    }
  });

  // Setup Overall Budget Form listener
  overallBudgetForm.addEventListener("submit", handleOverallBudgetSubmit);

  // Setup Category Budget Form listeners
  categoryBudgetForm.addEventListener("submit", handleCategoryBudgetSubmit);
  cancelCategoryBudgetBtn.addEventListener("click", cancelCategoryBudgetEdit);

  // Event delegation for Category Budget actions (Edit & Delete - SEC-08 XSS-03)
  if (categoryBudgetsList) {
    categoryBudgetsList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (action === "edit-budget") {
        startEditCategoryBudget(id);
      } else if (action === "delete-budget") {
        deleteCategoryBudget(id);
      }
    });
  }

  // Setup Budget Alert Modal listeners
  if (closeAlertModalBtn) closeAlertModalBtn.addEventListener("click", closeBudgetAlertModal);
  if (ackAlertModalBtn) ackAlertModalBtn.addEventListener("click", closeBudgetAlertModal);
  if (budgetAlertModal) {
    budgetAlertModal.addEventListener("click", (e) => {
      if (e.target === budgetAlertModal) closeBudgetAlertModal();
    });
  }

  // Close alert modal with Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && budgetAlertModal && budgetAlertModal.style.display !== "none") {
      closeBudgetAlertModal();
    }
  });

  // Setup Reports & Analytics listeners
  setupReportsListeners();

  // Setup Savings Goals listeners (Phase 4)
  setupSavingsGoalsListeners();

  // Setup User Authentication & Cloud Sync listeners (Phase 5)
  setupAuthListeners();
  initAuthStatus();

  // Restore previous active view tab if stored
  const savedView = localStorage.getItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY) || "dashboard-view";
  switchView(savedView);

  console.log("SpendWise initialized with Budget Alerts, Reports & Savings Goals!");
});

/**
 * Sets the date input in the transaction form to today's date (YYYY-MM-DD),
 * and sets default target date for savings goal form (3 months in future).
 */
function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  if (dateInput) dateInput.value = `${year}-${month}-${day}`;

  // Default target date for savings goals: 3 months from today
  if (goalTargetDateInput && !goalTargetDateInput.value) {
    const defaultTarget = new Date(today);
    defaultTarget.setMonth(defaultTarget.getMonth() + 3);
    const tYear = defaultTarget.getFullYear();
    const tMonth = String(defaultTarget.getMonth() + 1).padStart(2, "0");
    const tDay = String(defaultTarget.getDate()).padStart(2, "0");
    goalTargetDateInput.value = `${tYear}-${tMonth}-${tDay}`;
  }
  if (goalTargetDateInput) {
    goalTargetDateInput.min = `${year}-${month}-${day}`;
  }
}

// ==========================================================================
// 4. NAVIGATION SYSTEM (Dashboard, Transactions, Budgets)
// ==========================================================================

function setupNavigation() {
  // Delegated click handling for all navigation triggers with [data-view] (SEC-09)
  // Handles navbar tabs and in-page navigation buttons without inline onclick attributes
  document.addEventListener("click", (e) => {
    const targetEl = e.target.closest("[data-view]");
    if (!targetEl) return;
    const targetView = targetEl.getAttribute("data-view");
    if (targetView) {
      switchView(targetView);
    }
  });
}

/**
 * Switches the active page view and highlights the active navigation tab.
 * @param {string} viewId - The ID of the view section to display.
 */
function switchView(viewId) {
  navLinks.forEach((link) => {
    if (link.getAttribute("data-view") === viewId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  viewSections.forEach((section) => {
    if (section.id === viewId) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });

  localStorage.setItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY, viewId);
  renderAll();

  // If entering reports view, ensure charts resize properly
  if (viewId === "reports-view") {
    setTimeout(() => {
      if (typeof Chart !== "undefined") {
        if (incomeExpenseChartInstance && typeof incomeExpenseChartInstance.resize === "function") {
          incomeExpenseChartInstance.resize();
        }
        if (categoryChartInstance && typeof categoryChartInstance.resize === "function") {
          categoryChartInstance.resize();
        }
      }
    }, 60);
  }
}

window.switchView = switchView;

// ==========================================================================
// 5. DATA PERSISTENCE (User-Scoped & Guest LocalStorage - SEC-07)
// ==========================================================================

function loadAllData() {
  const userId = getActiveUserId();

  // 1. Load Transactions (scoped by active user ID or guest key)
  const txKey = getTxStorageKey(userId);
  const savedTx = localStorage.getItem(txKey);
  if (savedTx) {
    try {
      transactions = JSON.parse(savedTx);
      if (!Array.isArray(transactions)) transactions = [];
    } catch (e) {
      console.error("Error reading transactions from storage:", e);
      transactions = [];
    }
  } else {
    transactions = [];
  }

  // 2. Load Overall Budget (scoped by active user ID or guest key)
  const obKey = getOverallBudgetStorageKey(userId);
  const savedOverallBudget = localStorage.getItem(obKey);
  overallBudget = savedOverallBudget ? Number(savedOverallBudget) : 0;

  // 3. Load Category Budgets (scoped by active user ID or guest key)
  const cbKey = getCategoryBudgetsStorageKey(userId);
  const savedCatBudgets = localStorage.getItem(cbKey);
  if (savedCatBudgets) {
    try {
      categoryBudgets = JSON.parse(savedCatBudgets);
      if (!Array.isArray(categoryBudgets)) categoryBudgets = [];
    } catch (e) {
      console.error("Error reading category budgets from storage:", e);
      categoryBudgets = [];
    }
  } else {
    categoryBudgets = [];
  }

  // 4. Load Savings Goals (scoped by active user ID or guest key)
  const gKey = getGoalsStorageKey(userId);
  const savedGoals = localStorage.getItem(gKey);
  if (savedGoals) {
    try {
      savingsGoals = JSON.parse(savedGoals);
      if (!Array.isArray(savingsGoals)) savingsGoals = [];
    } catch (e) {
      console.error("Error reading savings goals from storage:", e);
      savingsGoals = [];
    }
  } else {
    savingsGoals = [];
  }

  // Clean up any legacy unscoped keys so they cannot pollute sessions
  purgeLegacyStorageKeys();

  renderAll();
}

function saveTransactions() {
  const key = getTxStorageKey(getActiveUserId());
  localStorage.setItem(key, JSON.stringify(transactions));
}

function saveOverallBudget() {
  const key = getOverallBudgetStorageKey(getActiveUserId());
  localStorage.setItem(key, overallBudget);
}

function saveCategoryBudgets() {
  const key = getCategoryBudgetsStorageKey(getActiveUserId());
  localStorage.setItem(key, JSON.stringify(categoryBudgets));
}

function saveSavingsGoals() {
  const key = getGoalsStorageKey(getActiveUserId());
  localStorage.setItem(key, JSON.stringify(savingsGoals));
}

function renderAll() {
  updateFinancialSummary();
  renderTransactions();
  renderBudgets();
  renderDashboardPreviews();
  renderReports();
  renderGoals();
}

// ==========================================================================
// 6. DATE & SPENDING CALCULATION HELPERS
// ==========================================================================

/**
 * Checks if a given transaction date string falls in the current calendar month and year.
 * @param {string} dateString - "YYYY-MM-DD"
 * @returns {boolean}
 */
function isCurrentMonthTransaction(dateString) {
  if (!dateString) return false;
  const parts = dateString.split("-");
  if (parts.length !== 3) return false;

  const txYear = parseInt(parts[0], 10);
  const txMonth = parseInt(parts[1], 10) - 1; // 0-indexed month in JS
  const now = new Date();

  return txYear === now.getFullYear() && txMonth === now.getMonth();
}

/**
 * Calculates total expenses spent.
 * @param {boolean} currentMonthOnly - If true, only sums expenses from the current calendar month.
 */
function getTotalExpenseSpent(currentMonthOnly = true) {
  return transactions.reduce((sum, tx) => {
    if (tx.type === "expense") {
      if (!currentMonthOnly || isCurrentMonthTransaction(tx.date)) {
        return sum + (Number(tx.amount) || 0);
      }
    }
    return sum;
  }, 0);
}

/**
 * Calculates total expenses spent for a specific category.
 * @param {string} categoryName - Category name to calculate for.
 * @param {boolean} currentMonthOnly - If true, only sums expenses from the current calendar month.
 */
function getCategorySpent(categoryName, currentMonthOnly = true) {
  return transactions.reduce((sum, tx) => {
    if (tx.type === "expense" && tx.category === categoryName) {
      if (!currentMonthOnly || isCurrentMonthTransaction(tx.date)) {
        return sum + (Number(tx.amount) || 0);
      }
    }
    return sum;
  }, 0);
}

// ==========================================================================
// 7. BUDGET MANAGEMENT (Overall & Category Budgets)
// ==========================================================================

/**
 * Handles Overall Monthly Budget Form Submission
 */
/**
 * Handles Overall Monthly Budget Form Submission
 */
async function handleOverallBudgetSubmit(event) {
  event.preventDefault();
  const limitValue = parseFloat(overallBudgetInput.value);

  if (isNaN(limitValue) || limitValue <= 0) {
    alert("Please enter a valid monthly overall budget amount greater than 0.");
    overallBudgetInput.focus();
    return;
  }

  const saveBtn = document.getElementById("save-overall-budget-btn");
  const originalBtnText = saveBtn ? saveBtn.textContent : "💾 Save Budget";

  if (authToken && currentUser) {
    if (!isBackendConfigured()) {
      showConfigError("update overall budget");
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "⏳ Saving...";
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/budgets/overall`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ overallMonthly: limitValue })
      });

      if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        handleAuthError(errData.message || "Your session has expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`⚠️ Failed to update overall budget: ${data.message || "Server error"}`);
        return;
      }

      overallBudget = limitValue;
      saveOverallBudget();
      renderBudgets();
      renderDashboardPreviews();
      alert(`Monthly overall budget updated to ${formatIndianCurrency(overallBudget)}!`);
    } catch (error) {
      console.error("Overall budget save error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to save overall budget.");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = originalBtnText;
      }
    }
  } else {
    // Guest / offline mode
    overallBudget = limitValue;
    saveOverallBudget();
    renderBudgets();
    renderDashboardPreviews();
    alert(`Monthly overall budget updated to ${formatIndianCurrency(overallBudget)}!`);
  }
}

/**
 * Handles Category Budget Form Submission (Add or Edit)
 */
async function handleCategoryBudgetSubmit(event) {
  event.preventDefault();

  const selectedCategory = categoryBudgetSelect.value;
  const budgetAmount = parseFloat(categoryBudgetAmountInput.value);

  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    alert("Please enter a valid budget amount greater than 0.");
    categoryBudgetAmountInput.focus();
    return;
  }

  const isEditing = editingCategoryBudgetId !== null;
  const originalBtnText = saveCategoryBudgetBtn ? saveCategoryBudgetBtn.textContent : "+ Set Category Budget";

  if (authToken && currentUser) {
    if (!isBackendConfigured()) {
      showConfigError("save category budget");
      return;
    }

    if (saveCategoryBudgetBtn) {
      saveCategoryBudgetBtn.disabled = true;
      saveCategoryBudgetBtn.textContent = isEditing ? "⏳ Updating..." : "⏳ Setting...";
    }

    try {
      if (isEditing) {
        // --- EDIT CATEGORY BUDGET VIA BACKEND API (PUT) ---
        const response = await fetch(`${BACKEND_API_URL}/budgets/category/${editingCategoryBudgetId}`, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ category: selectedCategory, amount: budgetAmount })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Your session has expired. Please log in again.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to update category budget: ${data.message || "Server error"}`);
          return;
        }

        // Update in-memory state from confirmed server response
        if (data.data && Array.isArray(data.data.categoryBudgets)) {
          categoryBudgets = data.data.categoryBudgets.map((b) => ({
            id: String(b._id || b.id),
            _id: String(b._id || b.id),
            category: b.category,
            amount: Number(b.amount)
          }));
        } else {
          const index = categoryBudgets.findIndex(
            (b) => String(b.id || b._id) === String(editingCategoryBudgetId)
          );
          if (index !== -1) {
            categoryBudgets[index].category = selectedCategory;
            categoryBudgets[index].amount = budgetAmount;
          }
        }

        cancelCategoryBudgetEdit();
      } else {
        // --- ADD CATEGORY BUDGET VIA BACKEND API (POST) ---
        const existingItem = categoryBudgets.find(
          (b) => b.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (existingItem) {
          const overwrite = confirm(
            `A budget for "${selectedCategory}" already exists (${formatIndianCurrency(
              existingItem.amount
            )}). Do you want to update it to ${formatIndianCurrency(budgetAmount)}?`
          );
          if (!overwrite) {
            if (saveCategoryBudgetBtn) {
              saveCategoryBudgetBtn.disabled = false;
              saveCategoryBudgetBtn.textContent = originalBtnText;
            }
            return;
          }
        }

        const response = await fetch(`${BACKEND_API_URL}/budgets/category`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ category: selectedCategory, amount: budgetAmount })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Your session has expired. Please log in again.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to save category budget: ${data.message || "Server error"}`);
          return;
        }

        // Update in-memory state from confirmed server response
        if (data.data && Array.isArray(data.data.categoryBudgets)) {
          categoryBudgets = data.data.categoryBudgets.map((b) => ({
            id: String(b._id || b.id),
            _id: String(b._id || b.id),
            category: b.category,
            amount: Number(b.amount)
          }));
        }

        categoryBudgetForm.reset();
      }

      saveCategoryBudgets();
      renderBudgets();
      renderDashboardPreviews();
    } catch (error) {
      console.error("Category budget API error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to save category budget.");
    } finally {
      if (saveCategoryBudgetBtn) {
        saveCategoryBudgetBtn.disabled = false;
        saveCategoryBudgetBtn.textContent = editingCategoryBudgetId ? "💾 Update Budget" : "+ Set Category Budget";
      }
    }
  } else {
    // Guest / offline mode
    if (isEditing) {
      const index = categoryBudgets.findIndex((b) => String(b.id || b._id) === String(editingCategoryBudgetId));
      if (index !== -1) {
        categoryBudgets[index].category = selectedCategory;
        categoryBudgets[index].amount = budgetAmount;
      }
      cancelCategoryBudgetEdit();
    } else {
      const existingIndex = categoryBudgets.findIndex((b) => b.category === selectedCategory);
      if (existingIndex !== -1) {
        const overwrite = confirm(
          `A budget for "${selectedCategory}" already exists (${formatIndianCurrency(categoryBudgets[existingIndex].amount)}). Do you want to update it to ${formatIndianCurrency(budgetAmount)}?`
        );
        if (overwrite) {
          categoryBudgets[existingIndex].amount = budgetAmount;
        } else {
          return;
        }
      } else {
        categoryBudgets.push({
          id: String(Date.now()),
          _id: String(Date.now()),
          category: selectedCategory,
          amount: budgetAmount
        });
      }
      categoryBudgetForm.reset();
    }

    saveCategoryBudgets();
    renderBudgets();
    renderDashboardPreviews();
  }
}

function startEditCategoryBudget(id) {
  const stringId = String(id);
  const budgetToEdit = categoryBudgets.find((b) => String(b.id || b._id) === stringId);
  if (!budgetToEdit) return;

  editingCategoryBudgetId = stringId;

  categoryBudgetSelect.value = budgetToEdit.category;
  categoryBudgetAmountInput.value = budgetToEdit.amount;

  categoryBudgetFormTitle.textContent = "Edit Category Budget";
  saveCategoryBudgetBtn.textContent = "💾 Update Budget";
  cancelCategoryBudgetBtn.style.display = "inline-block";

  switchView("budgets-view");
  categoryBudgetForm.scrollIntoView({ behavior: "smooth" });
  categoryBudgetAmountInput.focus();
}

function cancelCategoryBudgetEdit() {
  editingCategoryBudgetId = null;
  categoryBudgetFormTitle.textContent = "Add Category Budget";
  saveCategoryBudgetBtn.textContent = "+ Set Category Budget";
  cancelCategoryBudgetBtn.style.display = "none";
  categoryBudgetForm.reset();
}

async function deleteCategoryBudget(id) {
  const stringId = String(id);
  const budgetToDelete = categoryBudgets.find((b) => String(b.id || b._id) === stringId);
  if (!budgetToDelete) return;

  const confirmed = confirm(`Are you sure you want to delete the budget for "${budgetToDelete.category}"?`);
  if (!confirmed) return;

  if (authToken && currentUser) {
    if (!isBackendConfigured()) {
      showConfigError("delete category budget");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/budgets/category/${stringId}`, {
        method: "DELETE",
        headers: getAuthHeaders(false)
      });

      if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        handleAuthError(errData.message || "Your session has expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`⚠️ Failed to delete category budget: ${data.message || "Server error"}`);
        return;
      }

      if (String(editingCategoryBudgetId) === stringId) {
        cancelCategoryBudgetEdit();
      }

      if (data.data && Array.isArray(data.data.categoryBudgets)) {
        categoryBudgets = data.data.categoryBudgets.map((b) => ({
          id: String(b._id || b.id),
          _id: String(b._id || b.id),
          category: b.category,
          amount: Number(b.amount)
        }));
      } else {
        categoryBudgets = categoryBudgets.filter((b) => String(b.id || b._id) !== stringId);
      }

      saveCategoryBudgets();
      renderBudgets();
      renderDashboardPreviews();
    } catch (error) {
      console.error("Delete category budget error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to delete category budget.");
    }
  } else {
    if (String(editingCategoryBudgetId) === stringId) {
      cancelCategoryBudgetEdit();
    }

    categoryBudgets = categoryBudgets.filter((b) => String(b.id || b._id) !== stringId);
    saveCategoryBudgets();
    renderBudgets();
    renderDashboardPreviews();
  }
}

window.startEditCategoryBudget = startEditCategoryBudget;
window.deleteCategoryBudget = deleteCategoryBudget;

/**
 * Computes status class, progress bar class, and badge HTML based on percentage.
 */
function getBudgetStatus(percent, exceededAmount = 0) {
  if (percent >= 100) {
    return {
      progressClass: "progress-danger",
      badgeHtml: `<span class="badge badge-danger">🚨 Exceeded by ${formatIndianCurrency(exceededAmount)}</span>`
    };
  } else if (percent >= 80) {
    return {
      progressClass: "progress-warning",
      badgeHtml: `<span class="badge badge-warning">⚠️ ${percent}% Used (Near Limit)</span>`
    };
  } else {
    return {
      progressClass: "progress-normal",
      badgeHtml: `<span class="badge badge-normal">✅ On Track</span>`
    };
  }
}

/**
 * Renders Overall Monthly Budget and Category Budgets in the UI.
 */
function renderBudgets() {
  const totalSpent = getTotalExpenseSpent(true); // Current month spending
  const limit = overallBudget;
  const remaining = limit - totalSpent;
  const percent = limit > 0 ? Math.round((totalSpent / limit) * 100) : 0;
  const cappedPercent = Math.min(percent, 100);

  let overallStatus;
  if (limit <= 0) {
    overallStatus = {
      progressClass: "progress-normal",
      badgeHtml: `<span class="badge badge-normal">ℹ️ No Limit Configured</span>`
    };
  } else {
    overallStatus = getBudgetStatus(percent, Math.max(totalSpent - limit, 0));
  }

  // 1. Update Dashboard Overall Budget Widget
  if (dashOverallLimit) dashOverallLimit.textContent = formatIndianCurrency(limit);
  if (dashOverallSpent) dashOverallSpent.textContent = formatIndianCurrency(totalSpent);
  if (dashOverallRemaining) {
    if (limit <= 0) {
      dashOverallRemaining.textContent = "—";
      dashOverallRemaining.style.color = "var(--text-primary)";
    } else if (remaining < 0) {
      dashOverallRemaining.textContent = `-${formatIndianCurrency(Math.abs(remaining))}`;
      dashOverallRemaining.style.color = "var(--expense-red)";
    } else {
      dashOverallRemaining.textContent = formatIndianCurrency(remaining);
      dashOverallRemaining.style.color = "var(--income-green)";
    }
  }
  if (dashOverallPercent) dashOverallPercent.textContent = limit > 0 ? `${percent}%` : "0%";
  if (dashOverallProgressBar) {
    dashOverallProgressBar.style.width = `${cappedPercent}%`;
    dashOverallProgressBar.className = `progress-bar ${overallStatus.progressClass}`;
  }
  if (dashOverallStatusBadge) dashOverallStatusBadge.innerHTML = overallStatus.badgeHtml;

  // 2. Update Budgets View Overall Budget Card
  if (overallBudgetInput && overallBudget > 0) overallBudgetInput.value = overallBudget;
  if (budgetViewLimit) budgetViewLimit.textContent = formatIndianCurrency(limit);
  if (budgetViewSpent) budgetViewSpent.textContent = formatIndianCurrency(totalSpent);
  if (budgetViewRemaining) {
    if (limit <= 0) {
      budgetViewRemaining.textContent = "—";
      budgetViewRemaining.style.color = "var(--text-primary)";
    } else if (remaining < 0) {
      budgetViewRemaining.textContent = `-${formatIndianCurrency(Math.abs(remaining))}`;
      budgetViewRemaining.style.color = "var(--expense-red)";
    } else {
      budgetViewRemaining.textContent = formatIndianCurrency(remaining);
      budgetViewRemaining.style.color = "var(--income-green)";
    }
  }
  if (budgetViewPercent) budgetViewPercent.textContent = limit > 0 ? `${percent}%` : "0%";
  if (budgetViewProgressBar) {
    budgetViewProgressBar.style.width = `${cappedPercent}%`;
    budgetViewProgressBar.className = `progress-bar ${overallStatus.progressClass}`;
  }
  if (budgetViewStatusBadge) budgetViewStatusBadge.innerHTML = overallStatus.badgeHtml;

  // 3. Render Category Budgets List in Budgets View
  if (categoryBudgetsList) {
    categoryBudgetsList.innerHTML = "";

    if (categoryBudgets.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-list-message";
      emptyDiv.textContent = "No category budgets created yet. Add a category budget on the left to start tracking!";
      categoryBudgetsList.appendChild(emptyDiv);
    } else {
      categoryBudgets.forEach((b) => {
        const catSpent = getCategorySpent(b.category, true); // Current month spending
        const catLimit = b.amount;
        const catRemaining = catLimit - catSpent;
        const catPercent = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0;
        const catCapped = Math.min(catPercent, 100);
        const icon = getCategoryIcon(b.category, "🏷️");
        const status = getBudgetStatus(catPercent, Math.max(catSpent - catLimit, 0));

        const card = document.createElement("div");
        card.className = "category-budget-item";

        let remainingTextHtml;
        if (catRemaining < 0) {
          remainingTextHtml = `<strong class="expense-text">Over by ${formatIndianCurrency(Math.abs(catRemaining))}</strong>`;
        } else {
          remainingTextHtml = `<strong class="income-text">${formatIndianCurrency(catRemaining)} left</strong>`;
        }

        const safeCatId = escapeHTML(String(b.id || b._id));

        card.innerHTML = `
          <div class="category-budget-header">
            <div class="category-budget-info">
              <span>${icon}</span>
              <span>${escapeHTML(b.category)}</span>
            </div>
            <div>
              ${status.badgeHtml}
            </div>
          </div>

          <div class="category-budget-amounts">
            <span>Spent: <strong>${formatIndianCurrency(catSpent)}</strong> of ${formatIndianCurrency(catLimit)}</span>
            <span>${remainingTextHtml}</span>
          </div>

          <div class="progress-track">
            <div class="progress-bar ${status.progressClass}" style="width: ${catCapped}%;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">${catPercent}% used</span>
            <div class="tx-actions">
              <button 
                type="button" 
                class="action-btn edit-btn" 
                data-action="edit-budget" 
                data-id="${safeCatId}" 
                title="Edit Budget" 
                aria-label="Edit budget"
              >✏️</button>
              <button 
                type="button" 
                class="action-btn delete-btn" 
                data-action="delete-budget" 
                data-id="${safeCatId}" 
                title="Delete Budget" 
                aria-label="Delete budget"
              >&times;</button>
            </div>
          </div>
        `;

        categoryBudgetsList.appendChild(card);
      });
    }
  }

  // Update mini dashboard previews
  renderDashboardPreviews();
}

/**
 * Safely renders the Category Budgets Preview glance on the Dashboard (SEC-08).
 * Ensures trusted static icons and safe text rendering to prevent SVG/HTML injection.
 */
function updateCategoryPreview() {
  if (!dashCategoryPreviewList) return;
  dashCategoryPreviewList.innerHTML = "";
  if (categoryBudgets.length === 0) {
    dashCategoryPreviewList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 12px;">
        No budgets set. Click "Manage Budgets" to configure.
      </div>
    `;
  } else {
    categoryBudgets.slice(0, 3).forEach((b) => {
      const catSpent = getCategorySpent(b.category, true);
      const catPercent = b.amount > 0 ? Math.min(Math.round((catSpent / b.amount) * 100), 100) : 0;
      const icon = getCategoryIcon(b.category, "🏷️");
      const status = getBudgetStatus(catPercent);

      const row = document.createElement("div");
      row.className = "mini-row";
      row.innerHTML = `
        <div class="mini-row-left">
          <span>${icon}</span>
          <span>${escapeHTML(b.category)}</span>
        </div>
        <div style="width: 45%;">
          <div class="progress-track" style="height: 6px;">
            <div class="progress-bar ${status.progressClass}" style="width: ${catPercent}%;"></div>
          </div>
        </div>
        <div class="mini-row-right">
          ${catPercent}%
        </div>
      `;
      dashCategoryPreviewList.appendChild(row);
    });
  }
}

window.updateCategoryPreview = updateCategoryPreview;

/**
 * Renders Quick Glances on the Dashboard Overview View
 */
function renderDashboardPreviews() {
  // 1. Category Budgets Preview on Dashboard
  updateCategoryPreview();

  // 2. Recent Transactions Preview on Dashboard
  if (dashRecentPreviewList) {
    dashRecentPreviewList.innerHTML = "";
    if (transactions.length === 0) {
      dashRecentPreviewList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 12px;">
          No transactions yet. Click "View All" to add one.
        </div>
      `;
    } else {
      transactions.slice(0, 3).forEach((tx) => {
        const isIncome = tx.type === "income";
        const sign = isIncome ? "+" : "-";
        const colorClass = isIncome ? "income-text" : "expense-text";
        const icon = getCategoryIcon(tx.category, isIncome ? "💰" : "📦");

        const row = document.createElement("div");
        row.className = "mini-row";
        row.innerHTML = `
          <div class="mini-row-left">
            <span>${icon}</span>
            <span>${escapeHTML(tx.description)}</span>
          </div>
          <div class="mini-row-right ${colorClass}">
            ${sign}${formatIndianCurrency(tx.amount)}
          </div>
        `;
        dashRecentPreviewList.appendChild(row);
      });
    }
  }
}

// ==========================================================================
// 8. BUDGET POP-UP ALERT ENGINE
// ==========================================================================

/**
 * Checks if current month expense spending exceeds Overall or Category budgets.
 * Shows a pop-up alert EVERY TIME an expense transaction is added or edited
 * whenever the overall or category-wise budget is currently exceeded.
 * 
 * Rules:
 * 1. Overall budget: Checks total monthly expenses against overallBudget.
 *    If exceeded, adds the overall budget exceeded warning.
 * 2. Category budget: Checks the relevant category's monthly expenses.
 *    If exceeded, adds the category budget exceeded warning.
 * 3. If both are exceeded, both warnings are displayed together in the modal.
 * 4. Alerts do NOT appear when adding income, when limits are not exceeded, or on page reload.
 * 
 * @param {string} [targetCategory] - The category of the added or edited expense transaction.
 */
function checkBudgetAlerts(targetCategory) {
  const alertsToDisplay = [];

  // --- 1. CHECK OVERALL MONTHLY BUDGET ---
  const currentMonthTotalSpent = getTotalExpenseSpent(true);

  if (overallBudget > 0 && currentMonthTotalSpent > overallBudget) {
    alertsToDisplay.push({
      type: "overall",
      title: "Overall Monthly Budget Exceeded!",
      budgetAmount: overallBudget,
      spentAmount: currentMonthTotalSpent,
      exceededAmount: currentMonthTotalSpent - overallBudget,
      warningMessage: "You have exceeded your total monthly planned budget. Please review discretionary spending to keep your finances on track!"
    });
  }

  // --- 2. CHECK RELEVANT CATEGORY BUDGET ---
  if (targetCategory) {
    const matchedCategoryBudget = categoryBudgets.find((b) => b.category === targetCategory);
    if (matchedCategoryBudget && matchedCategoryBudget.amount > 0) {
      const catSpent = getCategorySpent(targetCategory, true);
      if (catSpent > matchedCategoryBudget.amount) {
        alertsToDisplay.push({
          type: "category",
          category: matchedCategoryBudget.category,
          title: `Category Budget Exceeded: ${matchedCategoryBudget.category}`,
          budgetAmount: matchedCategoryBudget.amount,
          spentAmount: catSpent,
          exceededAmount: catSpent - matchedCategoryBudget.amount,
          warningMessage: `Your spending on "${matchedCategoryBudget.category}" has crossed your monthly limit of ${formatIndianCurrency(matchedCategoryBudget.amount)}.`
        });
      }
    }
  } else {
    // If no specific category was specified (e.g., direct call), check all categories
    categoryBudgets.forEach((b) => {
      const catSpent = getCategorySpent(b.category, true);
      if (b.amount > 0 && catSpent > b.amount) {
        alertsToDisplay.push({
          type: "category",
          category: b.category,
          title: `Category Budget Exceeded: ${b.category}`,
          budgetAmount: b.amount,
          spentAmount: catSpent,
          exceededAmount: catSpent - b.amount,
          warningMessage: `Your spending on "${b.category}" has crossed your monthly limit of ${formatIndianCurrency(b.amount)}.`
        });
      }
    });
  }

  // If one or more limits are currently exceeded, show the pop-up modal!
  if (alertsToDisplay.length > 0) {
    openBudgetAlertModal(alertsToDisplay);
  }
}

window.checkBudgetAlerts = checkBudgetAlerts;

/**
 * Displays the Budget Exceeded Pop-up Alert Modal with all triggered warnings.
 * @param {Array} alerts - List of alert objects to display.
 */
function openBudgetAlertModal(alerts) {
  if (!budgetAlertModal || !budgetAlertsContainer) return;

  // Build the HTML cards for all exceeded alerts
  budgetAlertsContainer.innerHTML = alerts.map((alert) => {
    if (alert.type === "overall") {
      return `
        <div class="alert-item alert-overall-item">
          <div class="alert-item-header">
            <div class="alert-item-tag">🌐 ${escapeHTML(alert.title)}</div>
            <span class="exceeded-amount-badge">+${formatIndianCurrency(alert.exceededAmount)} Exceeded</span>
          </div>
          <div class="alert-item-metrics">
            <div class="alert-metric">
              <span class="label">Monthly Budget</span>
              <span class="val">${formatIndianCurrency(alert.budgetAmount)}</span>
            </div>
            <div class="alert-metric">
              <span class="label">Total Spent</span>
              <span class="val expense-text">${formatIndianCurrency(alert.spentAmount)}</span>
            </div>
            <div class="alert-metric">
              <span class="label">Amount Exceeded</span>
              <span class="val text-danger">+${formatIndianCurrency(alert.exceededAmount)}</span>
            </div>
          </div>
          <p class="alert-item-note">⚠️ ${escapeHTML(alert.warningMessage)}</p>
        </div>
      `;
    } else {
      const icon = getCategoryIcon(alert.category, "🏷️");
      return `
        <div class="alert-item alert-category-item">
          <div class="alert-item-header">
            <div class="alert-item-tag">${icon} ${escapeHTML(alert.title)}</div>
            <span class="exceeded-amount-badge">+${formatIndianCurrency(alert.exceededAmount)} Exceeded</span>
          </div>
          <div class="alert-item-metrics">
            <div class="alert-metric">
              <span class="label">Category Budget</span>
              <span class="val">${formatIndianCurrency(alert.budgetAmount)}</span>
            </div>
            <div class="alert-metric">
              <span class="label">Amount Spent</span>
              <span class="val expense-text">${formatIndianCurrency(alert.spentAmount)}</span>
            </div>
            <div class="alert-metric">
              <span class="label">Amount Exceeded</span>
              <span class="val text-danger">+${formatIndianCurrency(alert.exceededAmount)}</span>
            </div>
          </div>
          <p class="alert-item-note">⚠️ ${escapeHTML(alert.warningMessage)}</p>
        </div>
      `;
    }
  }).join("");

  // Reveal modal
  budgetAlertModal.style.display = "flex";
  budgetAlertModal.setAttribute("aria-hidden", "false");
}

/**
 * Closes the Budget Alert Modal.
 */
function closeBudgetAlertModal() {
  if (!budgetAlertModal) return;
  budgetAlertModal.style.display = "none";
  budgetAlertModal.setAttribute("aria-hidden", "true");
}

window.closeBudgetAlertModal = closeBudgetAlertModal;

// ==========================================================================
// 9. TRANSACTION MANAGEMENT (ADD, EDIT, DELETE, SEARCH, FILTER, SORT)
// ==========================================================================

async function handleTransactionFormSubmit(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;
  const category = categorySelect.value;
  const date = dateInput.value;

  if (!description) {
    alert("Please enter a transaction description.");
    descriptionInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0.");
    amountInput.focus();
    return;
  }

  if (!type || (type !== "income" && type !== "expense")) {
    alert("Please select a transaction type (Income or Expense).");
    typeSelect.focus();
    return;
  }

  if (!category) {
    alert("Please select a category.");
    categorySelect.focus();
    return;
  }

  if (!date) {
    alert("Please select a valid date.");
    dateInput.focus();
    return;
  }

  const isEditing = editingTransactionId !== null;

  // When user is authenticated, synchronize with MongoDB Atlas via Backend API
  if (authToken && currentUser) {
    if (!isBackendConfigured()) {
      showConfigError("save transaction");
      return;
    }

    const originalSubmitText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = isEditing ? "⏳ Updating..." : "⏳ Saving...";

    try {
      if (isEditing) {
        // --- 1. UPDATE TRANSACTION IN MONGODB ATLAS (PUT) ---
        const response = await fetch(`${BACKEND_API_URL}/transactions/${editingTransactionId}`, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ description, amount, type, category, date })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Your session has expired. Please log in again.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to update transaction: ${data.message || "Server error"}`);
          return;
        }

        // Update in-memory array only after backend confirms success
        const index = transactions.findIndex((t) => String(t.id || t._id) === String(editingTransactionId));
        if (index !== -1) {
          const updatedDoc = data.data || {};
          transactions[index] = {
            id: String(updatedDoc._id || updatedDoc.id || editingTransactionId),
            _id: String(updatedDoc._id || updatedDoc.id || editingTransactionId),
            description: updatedDoc.description || description,
            amount: Number(updatedDoc.amount !== undefined ? updatedDoc.amount : amount),
            type: updatedDoc.type || type,
            category: updatedDoc.category || category,
            date: updatedDoc.date || date
          };
        }

        cancelEditMode();
      } else {
        // --- 2. CREATE TRANSACTION IN MONGODB ATLAS (POST) ---
        const response = await fetch(`${BACKEND_API_URL}/transactions`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ description, amount, type, category, date })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Your session has expired. Please log in again.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to save transaction: ${data.message || "Server error"}`);
          return;
        }

        // Prepend created transaction only after backend confirms success
        const createdDoc = data.data || {};
        const newTransaction = {
          id: String(createdDoc._id || createdDoc.id),
          _id: String(createdDoc._id || createdDoc.id),
          description: createdDoc.description || description,
          amount: Number(createdDoc.amount !== undefined ? createdDoc.amount : amount),
          type: createdDoc.type || type,
          category: createdDoc.category || category,
          date: createdDoc.date || date
        };

        transactions.unshift(newTransaction);

        transactionForm.reset();
        setDefaultDate();
        typeSelect.value = "income";
        categorySelect.value = "Salary / Wages";
      }

      saveTransactions();
      renderAll();

      if (type === "expense") {
        checkBudgetAlerts(category);
      }
    } catch (error) {
      console.error("Transaction API Error:", error);
      alert("⚠️ Network error: Cannot reach the backend server. Please verify the API server is online and try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingTransactionId ? "💾 Update Transaction" : "+ Add Transaction";
    }
  } else {
    // Unauthenticated Guest mode: update locally only
    if (isEditing) {
      const index = transactions.findIndex((t) => String(t.id || t._id) === String(editingTransactionId));
      if (index !== -1) {
        transactions[index] = {
          id: String(editingTransactionId),
          _id: String(editingTransactionId),
          description,
          amount,
          type,
          category,
          date
        };
      }
      cancelEditMode();
    } else {
      const newTransaction = {
        id: String(Date.now()),
        _id: String(Date.now()),
        description,
        amount,
        type,
        category,
        date
      };
      transactions.unshift(newTransaction);

      transactionForm.reset();
      setDefaultDate();
      typeSelect.value = "income";
      categorySelect.value = "Salary / Wages";
    }

    saveTransactions();
    renderAll();

    if (type === "expense") {
      checkBudgetAlerts(category);
    }
  }
}

function startEditTransaction(id) {
  const stringId = String(id);
  const transactionToEdit = transactions.find((t) => String(t.id || t._id) === stringId);
  if (!transactionToEdit) return;

  editingTransactionId = stringId;

  descriptionInput.value = transactionToEdit.description;
  amountInput.value = transactionToEdit.amount;
  typeSelect.value = transactionToEdit.type;
  categorySelect.value = transactionToEdit.category;
  dateInput.value = transactionToEdit.date;

  formTitle.textContent = "Edit Transaction";
  submitBtn.textContent = "💾 Update Transaction";
  cancelEditBtn.style.display = "inline-block";

  switchView("transactions-view");
  transactionForm.scrollIntoView({ behavior: "smooth" });
  descriptionInput.focus();
}

function cancelEditMode() {
  editingTransactionId = null;
  formTitle.textContent = "Add Transaction";
  submitBtn.textContent = "+ Add Transaction";
  cancelEditBtn.style.display = "none";
  transactionForm.reset();
  setDefaultDate();
  typeSelect.value = "income";
  categorySelect.value = "Salary / Wages";
}

async function deleteTransaction(id) {
  const isConfirmed = confirm("Are you sure you want to delete this transaction?");
  if (!isConfirmed) return;

  const stringId = String(id);

  if (authToken && currentUser) {
    if (!isBackendConfigured()) {
      showConfigError("delete transaction");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/transactions/${stringId}`, {
        method: "DELETE",
        headers: getAuthHeaders(false)
      });

      if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        handleAuthError(errData.message || "Your session has expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`⚠️ Failed to delete transaction: ${data.message || "Server error"}`);
        return;
      }

      if (String(editingTransactionId) === stringId) {
        cancelEditMode();
      }

      // Remove from state only after backend confirms success
      transactions = transactions.filter((t) => String(t.id || t._id) !== stringId);
      saveTransactions();
      renderAll();
    } catch (error) {
      console.error("Delete Transaction API Error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to delete transaction.");
    }
  } else {
    if (String(editingTransactionId) === stringId) {
      cancelEditMode();
    }

    transactions = transactions.filter((t) => String(t.id || t._id) !== stringId);
    saveTransactions();
    renderAll();
  }
}

window.startEditTransaction = startEditTransaction;
window.deleteTransaction = deleteTransaction;

// Search, Filter & Sort Functions
function getFilteredAndSortedTransactions() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const typeFilter = filterTypeSelect.value;
  const categoryFilter = filterCategorySelect.value;
  const sortBy = sortBySelect.value;

  let result = transactions.filter((transaction) => {
    const matchesSearch = !searchTerm || transaction.description.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  result.sort((a, b) => {
    if (sortBy === "newest") {
      const dateComparison = new Date(b.date) - new Date(a.date);
      return dateComparison !== 0 ? dateComparison : String(b.id || b._id).localeCompare(String(a.id || a._id));
    } else if (sortBy === "oldest") {
      const dateComparison = new Date(a.date) - new Date(b.date);
      return dateComparison !== 0 ? dateComparison : String(a.id || a._id).localeCompare(String(b.id || b._id));
    } else if (sortBy === "highest") {
      return b.amount - a.amount;
    } else if (sortBy === "lowest") {
      return a.amount - b.amount;
    }
    return 0;
  });

  return result;
}

function resetFilters() {
  searchInput.value = "";
  filterTypeSelect.value = "all";
  filterCategorySelect.value = "all";
  sortBySelect.value = "newest";
  renderTransactions();
}

function renderTransactions() {
  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-list-message";
    emptyItem.textContent = "No transactions recorded yet. Add your first entry on the left!";
    transactionList.appendChild(emptyItem);
    return;
  }

  const displayList = getFilteredAndSortedTransactions();

  if (displayList.length === 0) {
    const noResultsItem = document.createElement("li");
    noResultsItem.className = "empty-list-message";
    noResultsItem.textContent = "🔍 No transactions found matching your search or filter criteria.";
    transactionList.appendChild(noResultsItem);
    return;
  }

  displayList.forEach((transaction) => {
    const li = document.createElement("li");
    li.className = `transaction-item ${transaction.type === "income" ? "income-item" : "expense-item"}`;

    const isIncome = transaction.type === "income";
    const sign = isIncome ? "+" : "-";
    const amountClass = isIncome ? "income-text" : "expense-text";
    const formattedDate = formatDateDisplay(transaction.date);
    const icon = getCategoryIcon(transaction.category, isIncome ? "💰" : "📦");
    const safeId = escapeHTML(String(transaction.id || transaction._id));

    li.innerHTML = `
      <div class="tx-info">
        <span class="tx-title">${icon} ${escapeHTML(transaction.description)}</span>
        <span class="tx-meta">${escapeHTML(transaction.category)} &bull; ${escapeHTML(formattedDate)}</span>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${amountClass}">
          ${sign}${formatIndianCurrency(transaction.amount)}
        </span>
        <div class="tx-actions">
          <button 
            type="button" 
            class="action-btn edit-btn" 
            data-action="edit-transaction" 
            data-id="${safeId}" 
            title="Edit Transaction" 
            aria-label="Edit transaction"
          >✏️</button>
          <button 
            type="button" 
            class="action-btn delete-btn" 
            data-action="delete-transaction" 
            data-id="${safeId}" 
            title="Delete Transaction" 
            aria-label="Delete transaction"
          >&times;</button>
        </div>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// ==========================================================================
// 10. FINANCIAL SUMMARY CARDS CALCULATIONS
// ==========================================================================

function updateFinancialSummary() {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += Number(transaction.amount) || 0;
    } else if (transaction.type === "expense") {
      totalExpenses += Number(transaction.amount) || 0;
    }
  });

  const totalBalance = totalIncome - totalExpenses;

  totalIncomeDisplay.textContent = `+${formatIndianCurrency(totalIncome)}`;
  totalExpensesDisplay.textContent = `-${formatIndianCurrency(totalExpenses)}`;

  if (totalBalance < 0) {
    totalBalanceDisplay.textContent = `-${formatIndianCurrency(Math.abs(totalBalance))}`;
    totalBalanceDisplay.style.color = "var(--expense-red)";
  } else {
    totalBalanceDisplay.textContent = formatIndianCurrency(totalBalance);
    totalBalanceDisplay.style.color = "var(--text-primary)";
  }
}

// ==========================================================================
// 11. HELPER FORMATTERS
// ==========================================================================

function formatIndianCurrency(amount) {
  const number = Number(amount) || 0;
  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDateDisplay(dateString) {
  if (!dateString || typeof dateString !== "string") return "";
  const trimmed = dateString.trim();
  const parts = trimmed.split("-");
  if (parts.length !== 3) return trimmed;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return trimmed;

  // Reject out-of-range calendar components before Date object creation
  if (year < 1000 || year > 9999 || month < 0 || month > 11 || day < 1 || day > 31) {
    return trimmed;
  }

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return trimmed;

  // Strict calendar verification: reject rolled-over invalid dates (e.g. 2026-02-31 normalized to 2026-03-03)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return trimmed;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#96;");
}

// ==========================================================================
// 12. REPORTS & ANALYTICS ENGINE (Chart.js Integration)
// ==========================================================================

/**
 * Initializes Event Listeners for Report Controls:
 * - Time period filters (This Week, This Month, This Year, All Time)
 * - Chart comparison granularity toggles (Weekly vs Monthly)
 */
function setupReportsListeners() {
  const periodButtons = document.querySelectorAll(".period-btn");
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      periodButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentReportPeriod = btn.getAttribute("data-period") || "month";
      renderReports();
    });
  });

  const weeklyBtn = document.getElementById("granularity-weekly-btn");
  const monthlyBtn = document.getElementById("granularity-monthly-btn");

  if (weeklyBtn) {
    weeklyBtn.addEventListener("click", () => {
      currentChartGranularity = "weekly";
      weeklyBtn.classList.add("active");
      if (monthlyBtn) monthlyBtn.classList.remove("active");
      const periodTransactions = getTransactionsInPeriod(currentReportPeriod);
      renderIncomeExpenseChart(periodTransactions);
    });
  }

  if (monthlyBtn) {
    monthlyBtn.addEventListener("click", () => {
      currentChartGranularity = "monthly";
      monthlyBtn.classList.add("active");
      if (weeklyBtn) weeklyBtn.classList.remove("active");
      const periodTransactions = getTransactionsInPeriod(currentReportPeriod);
      renderIncomeExpenseChart(periodTransactions);
    });
  }
}

/**
 * Returns date boundary objects and friendly display labels for a selected period.
 * @param {string} period - "week" | "month" | "year" | "all"
 * @returns {{ start: Date, end: Date, label: string }}
 */
function getPeriodDetails(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  if (period === "week") {
    // Current calendar week (Monday 00:00:00 to Sunday 23:59:59)
    const currentDayOfWeek = now.getDay();
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const startOfWeek = new Date(year, month, day - distanceToMonday, 0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startStr = `${startOfWeek.getDate()} ${shortMonthNames[startOfWeek.getMonth()]}`;
    const endStr = `${endOfWeek.getDate()} ${shortMonthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;

    return {
      start: startOfWeek,
      end: endOfWeek,
      label: `This Week (${startStr} – ${endStr})`
    };
  } else if (period === "month") {
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return {
      start: startOfMonth,
      end: endOfMonth,
      label: `${monthNames[month]} ${year}`
    };
  } else if (period === "year") {
    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    return {
      start: startOfYear,
      end: endOfYear,
      label: `Year ${year}`
    };
  } else {
    // "all"
    return {
      start: new Date(0),
      end: new Date(8640000000000000),
      label: "All Time (Complete History)"
    };
  }
}

/**
 * Filters the master transactions array down to entries falling within the given period.
 * @param {string} period - "week" | "month" | "year" | "all"
 * @returns {Array} Array of transaction objects
 */
function getTransactionsInPeriod(period) {
  if (period === "all") return [...transactions];

  const { start, end } = getPeriodDetails(period);

  return transactions.filter((tx) => {
    if (!tx.date) return false;
    const parts = tx.date.split("-");
    if (parts.length !== 3) return false;
    const txDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return txDate >= start && txDate <= end;
  });
}

/**
 * Main coordinator function that updates all Reports UI:
 * - Period Summary Metrics (Income, Expenses, Savings, Savings Rate)
 * - Empty state detection
 * - Chart.js Income vs Expenses Bar Chart
 * - Chart.js Category Breakdown Doughnut Chart & Table List
 * - Dynamic Financial Insights
 */
function renderReports() {
  const periodTransactions = getTransactionsInPeriod(currentReportPeriod);
  const periodInfo = getPeriodDetails(currentReportPeriod);

  // 1. Update Selected Period Status Badge
  const periodLabelEl = document.getElementById("report-period-label");
  if (periodLabelEl) {
    periodLabelEl.textContent = `Report Period: ${periodInfo.label}`;
  }

  // 2. Calculate Period Totals (Strictly separating income and expense types)
  let periodIncome = 0;
  let periodExpenses = 0;

  periodTransactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") {
      periodIncome += amt;
    } else if (tx.type === "expense") {
      periodExpenses += amt;
    }
  });

  const periodSavings = periodIncome - periodExpenses;
  const savingsRate = periodIncome > 0 ? Math.round((periodSavings / periodIncome) * 100) : 0;

  // 3. Update Period Summary Cards in UI
  const periodIncomeEl = document.getElementById("report-period-income");
  const periodExpensesEl = document.getElementById("report-period-expenses");
  const netSavingsEl = document.getElementById("report-net-savings");
  const savingsRateEl = document.getElementById("report-savings-rate");

  if (periodIncomeEl) periodIncomeEl.textContent = `+${formatIndianCurrency(periodIncome)}`;
  if (periodExpensesEl) periodExpensesEl.textContent = `-${formatIndianCurrency(periodExpenses)}`;

  if (netSavingsEl) {
    if (periodSavings >= 0) {
      netSavingsEl.textContent = `+${formatIndianCurrency(periodSavings)}`;
      netSavingsEl.style.color = "var(--income-green)";
    } else {
      netSavingsEl.textContent = `-${formatIndianCurrency(Math.abs(periodSavings))}`;
      netSavingsEl.style.color = "var(--expense-red)";
    }
  }

  if (savingsRateEl) {
    if (periodIncome > 0) {
      savingsRateEl.textContent = `${savingsRate}%`;
      savingsRateEl.style.color = savingsRate >= 0 ? "var(--income-green)" : "var(--expense-red)";
    } else {
      savingsRateEl.textContent = "0%";
      savingsRateEl.style.color = "var(--text-secondary)";
    }
  }

  // 4. Handle Empty State vs Active Charts
  const emptyStateEl = document.getElementById("reports-empty-state");
  const chartsContainerEl = document.getElementById("reports-charts-container");

  if (periodTransactions.length === 0) {
    if (emptyStateEl) emptyStateEl.style.display = "block";
    if (chartsContainerEl) chartsContainerEl.style.display = "none";

    // Cleanly destroy active Chart.js instances if any exist
    if (incomeExpenseChartInstance) {
      incomeExpenseChartInstance.destroy();
      incomeExpenseChartInstance = null;
    }
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }

    renderFinancialInsights([], 0, 0, 0, 0);
    return;
  }

  if (emptyStateEl) emptyStateEl.style.display = "none";
  if (chartsContainerEl) chartsContainerEl.style.display = "grid";

  // 5. Render Visual Charts & Insights
  renderIncomeExpenseChart(periodTransactions);
  renderCategoryChart(periodTransactions);
  renderFinancialInsights(periodTransactions, periodIncome, periodExpenses, periodSavings, savingsRate);
}

/**
 * Builds and renders the Income vs Expenses comparison bar chart using Chart.js.
 * Dynamically aggregates by day, week, or month based on user filters.
 */
function renderIncomeExpenseChart(periodTransactions) {
  const canvas = document.getElementById("income-expenses-chart");
  if (!canvas) return;
  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded. Skipping Income vs Expenses chart rendering.");
    return;
  }

  let labels = [];
  let incomeData = [];
  let expenseData = [];

  const now = new Date();
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (currentChartGranularity === "monthly" || currentReportPeriod === "year") {
    // --- MONTHLY COMPARISON (12 Months of the Year) ---
    labels = shortMonths;
    incomeData = new Array(12).fill(0);
    expenseData = new Array(12).fill(0);

    periodTransactions.forEach((tx) => {
      const parts = tx.date.split("-");
      if (parts.length === 3) {
        const txMonth = parseInt(parts[1], 10) - 1;
        const amt = Number(tx.amount) || 0;
        if (txMonth >= 0 && txMonth < 12) {
          if (tx.type === "income") incomeData[txMonth] += amt;
          else if (tx.type === "expense") expenseData[txMonth] += amt;
        }
      }
    });
  } else if (currentReportPeriod === "week") {
    // --- WEEKLY COMPARISON: DAILY BREAKDOWN (Mon - Sun) ---
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    labels = dayNames;
    incomeData = new Array(7).fill(0);
    expenseData = new Array(7).fill(0);

    const periodInfo = getPeriodDetails("week");
    const monday = new Date(periodInfo.start);

    // Build map for each day of the current week (YYYY-MM-DD -> index 0-6)
    const dayIndexMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      dayIndexMap[`${y}-${m}-${dayStr}`] = i;
    }

    periodTransactions.forEach((tx) => {
      const idx = dayIndexMap[tx.date];
      if (idx !== undefined) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === "income") incomeData[idx] += amt;
        else if (tx.type === "expense") expenseData[idx] += amt;
      }
    });
  } else {
    // --- MONTHLY VIEW: 5 CALENDAR WEEKS BREAKDOWN ---
    labels = ["Week 1 (1-7)", "Week 2 (8-14)", "Week 3 (15-21)", "Week 4 (22-28)", "Week 5 (29+)"];
    incomeData = new Array(5).fill(0);
    expenseData = new Array(5).fill(0);

    periodTransactions.forEach((tx) => {
      const parts = tx.date.split("-");
      if (parts.length === 3) {
        const dayOfMonth = parseInt(parts[2], 10);
        let bucketIndex = 0;
        if (dayOfMonth <= 7) bucketIndex = 0;
        else if (dayOfMonth <= 14) bucketIndex = 1;
        else if (dayOfMonth <= 21) bucketIndex = 2;
        else if (dayOfMonth <= 28) bucketIndex = 3;
        else bucketIndex = 4;

        const amt = Number(tx.amount) || 0;
        if (tx.type === "income") incomeData[bucketIndex] += amt;
        else if (tx.type === "expense") expenseData[bucketIndex] += amt;
      }
    });
  }

  // Destroy previous chart instance before creating a new one to prevent canvas collisions
  if (incomeExpenseChartInstance) {
    incomeExpenseChartInstance.destroy();
  }

  // Determine current active theme for Chart.js rendering
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  const ctx = canvas.getContext("2d");
  incomeExpenseChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Income (+)",
          data: incomeData,
          backgroundColor: isDark ? "rgba(16, 185, 129, 0.85)" : "rgba(0, 184, 148, 0.82)",
          borderColor: isDark ? "#10b981" : "#00b894",
          borderWidth: 1.5,
          borderRadius: 6,
          maxBarThickness: 34
        },
        {
          label: "Expenses (-)",
          data: expenseData,
          backgroundColor: isDark ? "rgba(239, 68, 68, 0.85)" : "rgba(214, 48, 49, 0.82)",
          borderColor: isDark ? "#ef4444" : "#d63031",
          borderWidth: 1.5,
          borderRadius: 6,
          maxBarThickness: 34
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: isDark ? "#f1f5f9" : "#2d3436",
            font: { family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", weight: 600, size: 12 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: isDark ? "#1a1d26" : "#2d3436",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: isDark ? "#2e3446" : "transparent",
          borderWidth: isDark ? 1 : 0,
          titleFont: { size: 12, weight: 700 },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatIndianCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { weight: 600, size: 11 }, color: isDark ? "#94a3b8" : "#636e72" }
        },
        y: {
          beginAtZero: true,
          grid: { color: isDark ? "#2e3446" : "#f1f2f6" },
          ticks: {
            font: { size: 11 },
            color: isDark ? "#94a3b8" : "#636e72",
            callback: function (value) {
              return "₹" + value.toLocaleString("en-IN");
            }
          }
        }
      }
    }
  });
}

/**
 * Builds and renders the Category-Wise Expenses Doughnut Chart and detailed breakdown list.
 * Excludes income transactions entirely; shows names, amounts, and percentages.
 */
function renderCategoryChart(periodTransactions) {
  const canvas = document.getElementById("category-expenses-chart");
  const breakdownListEl = document.getElementById("report-category-breakdown-list");
  if (!canvas || !breakdownListEl) return;

  // Filter only expense transactions
  const expenseTxs = periodTransactions.filter((tx) => tx.type === "expense");

  if (expenseTxs.length === 0) {
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }
    breakdownListEl.innerHTML = `
      <div class="empty-list-message" style="margin-top: 18px;">
        No expense entries recorded for this period.
      </div>
    `;
    return;
  }

  // Aggregate spending by category
  const catMap = {};
  let totalPeriodExpenses = 0;

  expenseTxs.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    catMap[tx.category] = (catMap[tx.category] || 0) + amt;
    totalPeriodExpenses += amt;
  });

  // Sort categories descending by spend amount
  const sortedCategories = Object.keys(catMap)
    .map((cat) => ({
      category: cat,
      amount: catMap[cat],
      percent: totalPeriodExpenses > 0 ? Math.round((catMap[cat] / totalPeriodExpenses) * 100) : 0,
      exactPercent: totalPeriodExpenses > 0 ? ((catMap[cat] / totalPeriodExpenses) * 100).toFixed(1) : "0.0",
      color: getCategoryColor(cat, "#6c5ce7")
    }))
    .sort((a, b) => b.amount - a.amount);

  const labels = sortedCategories.map((c) => c.category);
  const data = sortedCategories.map((c) => c.amount);
  const colors = sortedCategories.map((c) => c.color);

  // Destroy previous chart instance before re-creating
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
    categoryChartInstance = null;
  }

  // Render chart only if Chart.js is loaded
  if (typeof Chart !== "undefined") {
    // Determine current active theme for Doughnut border and tooltips
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    const ctx = canvas.getContext("2d");
    categoryChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: isDark ? "#1a1d26" : "#ffffff",
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "64%",
        plugins: {
          legend: {
            display: false // Using custom interactive breakdown list below
          },
          tooltip: {
            backgroundColor: isDark ? "#1a1d26" : "#2d3436",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: isDark ? "#2e3446" : "transparent",
            borderWidth: isDark ? 1 : 0,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const val = context.raw || 0;
                const pct = totalPeriodExpenses > 0 ? ((val / totalPeriodExpenses) * 100).toFixed(1) : 0;
                return `${label}: ${formatIndianCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  } else {
    console.warn("Chart.js is not loaded. Skipping Category Expenses Doughnut chart rendering.");
  }

  // Render Detailed Category Breakdown List with percentages, amounts, and progress bars
  breakdownListEl.innerHTML = sortedCategories
    .map((item) => {
      const icon = getCategoryIcon(item.category, "📦");
      return `
        <div class="category-breakdown-item">
          <div class="cat-breakdown-header">
            <div class="cat-breakdown-name">
              <span class="cat-dot" style="background-color: ${item.color};"></span>
              <span>${icon} ${escapeHTML(item.category)}</span>
            </div>
            <div class="cat-breakdown-numbers">
              <span class="cat-breakdown-amount">${formatIndianCurrency(item.amount)}</span>
              <span class="cat-breakdown-pct">${item.exactPercent}%</span>
            </div>
          </div>
          <div class="cat-progress-track">
            <div class="cat-progress-bar" style="width: ${item.percent}%; background-color: ${item.color};"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Calculates and displays dynamic Financial Insights & Analytics:
 * - Highest spending category
 * - Average expense per transaction
 * - Context-aware, personalized financial advice
 */
function renderFinancialInsights(periodTransactions, periodIncome, periodExpenses, periodSavings, savingsRate) {
  // 1. Highest Spending Category
  const expenseTxs = periodTransactions.filter((tx) => tx.type === "expense");
  const topCatIconEl = document.getElementById("insight-top-cat-icon");
  const topCatNameEl = document.getElementById("insight-top-cat-name");
  const topCatDescEl = document.getElementById("insight-top-cat-desc");

  let topCategory = null;

  if (expenseTxs.length > 0) {
    const catMap = {};
    expenseTxs.forEach((tx) => {
      catMap[tx.category] = (catMap[tx.category] || 0) + (Number(tx.amount) || 0);
    });

    const sorted = Object.keys(catMap)
      .map((cat) => ({
        category: cat,
        amount: catMap[cat],
        pct: periodExpenses > 0 ? ((catMap[cat] / periodExpenses) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    topCategory = sorted[0];

    if (topCatIconEl) topCatIconEl.textContent = getCategoryIcon(topCategory.category, "🏷️");
    if (topCatNameEl) topCatNameEl.textContent = topCategory.category;
    if (topCatDescEl) topCatDescEl.textContent = `${formatIndianCurrency(topCategory.amount)} (${topCategory.pct}% of period expenses)`;
  } else {
    if (topCatIconEl) topCatIconEl.textContent = "🏷️";
    if (topCatNameEl) topCatNameEl.textContent = "None";
    if (topCatDescEl) topCatDescEl.textContent = "No expense records found";
  }

  // 2. Average Expenses Calculation
  const avgExpenseEl = document.getElementById("insight-avg-expense");
  const avgExpenseDescEl = document.getElementById("insight-avg-expense-desc");

  if (expenseTxs.length > 0) {
    const avgAmount = periodExpenses / expenseTxs.length;
    if (avgExpenseEl) avgExpenseEl.textContent = formatIndianCurrency(avgAmount);
    if (avgExpenseDescEl) avgExpenseDescEl.textContent = `Across ${expenseTxs.length} expense transaction${expenseTxs.length !== 1 ? "s" : ""}`;
  } else {
    if (avgExpenseEl) avgExpenseEl.textContent = "₹0.00";
    if (avgExpenseDescEl) avgExpenseDescEl.textContent = "0 expense entries logged";
  }

  // 3. Actionable Spending Advice & Financial Health Insight
  const adviceIconEl = document.getElementById("insight-advice-icon");
  const adviceMessageEl = document.getElementById("insight-advice-message");

  if (!adviceIconEl || !adviceMessageEl) return;

  if (periodTransactions.length === 0) {
    adviceIconEl.textContent = "💡";
    adviceMessageEl.textContent = "No transactions recorded for this period. Add income and expenses to unlock personalized financial insights.";
  } else if (periodSavings < 0) {
    adviceIconEl.textContent = "🚨";
    const topNote = topCategory ? `Your highest spending category is ${escapeHTML(topCategory.category)} (${formatIndianCurrency(topCategory.amount)}).` : "";
    adviceMessageEl.innerHTML = `<strong>Deficit Alert:</strong> Spending exceeds income by <strong>${formatIndianCurrency(Math.abs(periodSavings))}</strong> in this period. ${topNote} Review non-essential spending to bring cash flow back into surplus.`;
  } else if (savingsRate >= 30) {
    adviceIconEl.textContent = "🌟";
    adviceMessageEl.innerHTML = `<strong>Outstanding Savings Rate:</strong> You saved <strong>${savingsRate}%</strong> of your income this period (${formatIndianCurrency(periodSavings)}). You are building your financial safety net rapidly!`;
  } else if (savingsRate >= 15) {
    adviceIconEl.textContent = "✅";
    adviceMessageEl.innerHTML = `<strong>Healthy Cash Flow:</strong> You saved <strong>${savingsRate}%</strong> of your income (${formatIndianCurrency(periodSavings)}). Aim for at least 20% to further accelerate your investment goals.`;
  } else if (periodSavings >= 0 && periodIncome > 0) {
    adviceIconEl.textContent = "⚖️";
    adviceMessageEl.innerHTML = `<strong>Tight Margin:</strong> You saved <strong>${savingsRate}%</strong> (${formatIndianCurrency(periodSavings)}). Setting category limits in the <em>Budgets</em> tab will help you save more consistently.`;
  } else {
    // Only income or only expenses
    adviceIconEl.textContent = "📈";
    adviceMessageEl.innerHTML = `Net cash flow for this period is <strong>${periodSavings >= 0 ? "+" : ""}${formatIndianCurrency(periodSavings)}</strong>. Continue recording all daily earnings and expenses to get the full picture.`;
  }
}

window.renderReports = renderReports;

// ==========================================================================
// 13. SAVINGS GOALS ENGINE (Phase 4)
// ==========================================================================

/**
 * Initializes Event Listeners for Savings Goals:
 * - Goal creation & edit form submissions
 * - Cancel edit button
 * - Add savings (deposit) modal form & actions
 */
function setupSavingsGoalsListeners() {
  if (goalForm) {
    goalForm.addEventListener("submit", handleGoalFormSubmit);
  }

  if (cancelGoalEditBtn) {
    cancelGoalEditBtn.addEventListener("click", cancelGoalEdit);
  }

  if (addSavingsForm) {
    addSavingsForm.addEventListener("submit", handleAddSavingsSubmit);
  }

  if (closeAddSavingsModalBtn) {
    closeAddSavingsModalBtn.addEventListener("click", closeAddSavingsModal);
  }

  if (cancelDepositBtn) {
    cancelDepositBtn.addEventListener("click", closeAddSavingsModal);
  }

  if (addSavingsModal) {
    addSavingsModal.addEventListener("click", (e) => {
      if (e.target === addSavingsModal) closeAddSavingsModal();
    });
  }

  // Close deposit modal with Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && addSavingsModal && addSavingsModal.style.display !== "none") {
      closeAddSavingsModal();
    }
  });

  // Event delegation for Savings Goal actions (Edit, Delete, Add Savings - SEC-08 XSS-03)
  if (savingsGoalsList) {
    savingsGoalsList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (action === "edit-goal") {
        startEditGoal(id);
      } else if (action === "delete-goal") {
        deleteGoal(id);
      } else if (action === "add-savings") {
        openAddSavingsModal(id);
      }
    });
  }
}

/**
 * Handles Goal Form Submission (Create new or update existing goal)
 */
async function handleGoalFormSubmit(event) {
  event.preventDefault();

  const name = goalNameInput.value.trim();
  const targetAmount = parseFloat(goalTargetAmountInput.value);
  const savedAmount = parseFloat(goalSavedAmountInput.value) || 0;
  const targetDate = goalTargetDateInput.value;
  const description = goalDescriptionInput.value.trim();

  // 1. Validation Checks
  if (!name) {
    alert("Please enter a name for your savings goal.");
    goalNameInput.focus();
    return;
  }

  if (isNaN(targetAmount) || targetAmount <= 0) {
    alert("Target amount must be greater than zero.");
    goalTargetAmountInput.focus();
    return;
  }

  if (isNaN(savedAmount) || savedAmount < 0) {
    alert("Saved amount cannot be negative.");
    goalSavedAmountInput.focus();
    return;
  }

  if (savedAmount > targetAmount) {
    alert(`Saved amount (${formatIndianCurrency(savedAmount)}) cannot exceed the target amount (${formatIndianCurrency(targetAmount)}).`);
    goalSavedAmountInput.focus();
    return;
  }

  if (!targetDate) {
    alert("Please select a target date for your savings goal.");
    goalTargetDateInput.focus();
    return;
  }

  const cleanTarget = Math.round(targetAmount * 100) / 100;
  const cleanSaved = Math.round(savedAmount * 100) / 100;
  const isCompleted = cleanSaved >= cleanTarget;

  const isEditing = editingGoalId !== null;
  const originalBtnText = saveGoalBtn ? saveGoalBtn.textContent : "+ Create Goal";

  const token = getAuthToken();
  const user = getCurrentUser();

  if (token && user) {
    if (!isBackendConfigured()) {
      showConfigError("save savings goal");
      return;
    }

    if (saveGoalBtn) {
      saveGoalBtn.disabled = true;
      saveGoalBtn.textContent = isEditing ? "⏳ Updating..." : "⏳ Creating...";
    }

    try {
      if (isEditing) {
        // --- PUT /api/goals/:id ---
        const response = await fetch(`${BACKEND_API_URL}/goals/${editingGoalId}`, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            name,
            targetAmount: cleanTarget,
            savedAmount: cleanSaved,
            targetDate,
            description
          })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Access denied. Please log in to access this resource.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to update savings goal: ${data.message || "Server error"}`);
          return;
        }

        const index = savingsGoals.findIndex((g) => String(g.id || g._id) === String(editingGoalId));
        if (index !== -1 && data.data) {
          savingsGoals[index] = {
            id: String(data.data._id || data.data.id || editingGoalId),
            _id: String(data.data._id || data.data.id || editingGoalId),
            name: data.data.name,
            targetAmount: Number(data.data.targetAmount),
            savedAmount: Number(data.data.savedAmount),
            targetDate: data.data.targetDate,
            description: data.data.description,
            isCompleted: data.data.isCompleted,
            completedAt: data.data.completedAt,
            createdAt: data.data.createdAt
          };
        }

        cancelGoalEdit();
        alert(`Savings goal "${name}" updated successfully!`);
      } else {
        // --- POST /api/goals ---
        const response = await fetch(`${BACKEND_API_URL}/goals`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            name,
            targetAmount: cleanTarget,
            savedAmount: cleanSaved,
            targetDate,
            description
          })
        });

        if (response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          handleAuthError(errData.message || "Access denied. Please log in to access this resource.");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(`⚠️ Failed to create savings goal: ${data.message || "Server error"}`);
          return;
        }

        if (data.data) {
          const newGoal = {
            id: String(data.data._id || data.data.id),
            _id: String(data.data._id || data.data.id),
            name: data.data.name,
            targetAmount: Number(data.data.targetAmount),
            savedAmount: Number(data.data.savedAmount),
            targetDate: data.data.targetDate,
            description: data.data.description,
            isCompleted: data.data.isCompleted,
            completedAt: data.data.completedAt,
            createdAt: data.data.createdAt
          };
          savingsGoals.unshift(newGoal);
        }

        goalForm.reset();
        setDefaultDate();
        if (goalSavedAmountInput) goalSavedAmountInput.value = "0";

        if (isCompleted) {
          alert(`🎉 Congratulations! You created and already reached your goal: "${name}" (${formatIndianCurrency(cleanTarget)})!`);
        } else {
          alert(`Savings goal "${name}" created successfully!`);
        }
      }

      saveSavingsGoals();
      renderGoals();
    } catch (error) {
      console.error("Savings goal save error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to save savings goal.");
    } finally {
      if (saveGoalBtn) {
        saveGoalBtn.disabled = false;
        saveGoalBtn.textContent = editingGoalId ? "💾 Update Goal" : "+ Create Goal";
      }
    }
  } else {
    // Unauthenticated user
    alert("⚠️ Access denied. Please log in to save your savings goals to the cloud.");
    openAuthModal("login");
  }
}

/**
 * Puts the Goal Form into Edit Mode for an existing savings goal
 */
function startEditGoal(id) {
  const stringId = String(id);
  const goalToEdit = savingsGoals.find((g) => String(g.id || g._id) === stringId);
  if (!goalToEdit) return;

  editingGoalId = stringId;

  goalNameInput.value = goalToEdit.name;
  goalTargetAmountInput.value = goalToEdit.targetAmount;
  goalSavedAmountInput.value = goalToEdit.savedAmount;
  goalTargetDateInput.value = goalToEdit.targetDate;
  goalDescriptionInput.value = goalToEdit.description || "";

  goalFormTitle.textContent = "Edit Savings Goal";
  saveGoalBtn.textContent = "💾 Update Goal";
  cancelGoalEditBtn.style.display = "inline-block";

  switchView("goals-view");
  goalForm.scrollIntoView({ behavior: "smooth" });
  goalNameInput.focus();
}

/**
 * Cancels Goal Edit Mode and resets the form to Create Mode
 */
function cancelGoalEdit() {
  editingGoalId = null;
  goalFormTitle.textContent = "Create Savings Goal";
  saveGoalBtn.textContent = "+ Create Goal";
  cancelGoalEditBtn.style.display = "none";
  goalForm.reset();
  setDefaultDate();
  if (goalSavedAmountInput) goalSavedAmountInput.value = "0";
}

/**
 * Deletes a savings goal after user confirmation
 */
async function deleteGoal(id) {
  const stringId = String(id);
  const goalToDelete = savingsGoals.find((g) => String(g.id || g._id) === stringId);
  if (!goalToDelete) return;

  const confirmed = confirm(`Are you sure you want to delete the savings goal "${goalToDelete.name}"?`);
  if (!confirmed) return;

  const token = getAuthToken();
  const user = getCurrentUser();

  if (token && user) {
    if (!isBackendConfigured()) {
      showConfigError("delete savings goal");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/goals/${stringId}`, {
        method: "DELETE",
        headers: getAuthHeaders(false)
      });

      if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        handleAuthError(errData.message || "Access denied. Please log in to access this resource.");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`⚠️ Failed to delete savings goal: ${data.message || "Server error"}`);
        return;
      }

      if (String(editingGoalId) === stringId) {
        cancelGoalEdit();
      }

      savingsGoals = savingsGoals.filter((g) => String(g.id || g._id) !== stringId);
      saveSavingsGoals();
      renderGoals();
    } catch (error) {
      console.error("Delete goal error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to delete savings goal.");
    }
  } else {
    alert("⚠️ Access denied. Please log in to delete savings goals.");
    openAuthModal("login");
  }
}

/**
 * Opens the "Add Savings" deposit modal for a specific goal
 */
function openAddSavingsModal(id) {
  const stringId = String(id);
  const goal = savingsGoals.find((g) => String(g.id || g._id) === stringId);
  if (!goal) return;

  if (goal.isCompleted) {
    alert(`The goal "${goal.name}" has already reached its target!`);
    return;
  }

  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

  if (depositGoalId) depositGoalId.value = stringId;
  if (depositModalTitle) depositModalTitle.textContent = `Add Savings to "${goal.name}"`;
  if (depositCurrentSaved) depositCurrentSaved.textContent = formatIndianCurrency(goal.savedAmount);
  if (depositTarget) depositTarget.textContent = formatIndianCurrency(goal.targetAmount);
  if (depositRemaining) depositRemaining.textContent = formatIndianCurrency(remaining);

  if (depositAmountInput) {
    depositAmountInput.value = "";
    depositAmountInput.max = remaining.toFixed(2);
  }

  if (addSavingsModal) {
    addSavingsModal.style.display = "flex";
    addSavingsModal.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      if (depositAmountInput) depositAmountInput.focus();
    }, 50);
  }
}

/**
 * Closes the "Add Savings" modal
 */
function closeAddSavingsModal() {
  if (!addSavingsModal) return;
  addSavingsModal.style.display = "none";
  addSavingsModal.setAttribute("aria-hidden", "true");
  if (addSavingsForm) addSavingsForm.reset();
}

/**
 * Handles deposit submission to update a goal's saved amount
 */
async function handleAddSavingsSubmit(event) {
  event.preventDefault();

  const stringId = String(depositGoalId.value);
  const depositAmount = parseFloat(depositAmountInput.value);

  const goal = savingsGoals.find((g) => String(g.id || g._id) === stringId);
  if (!goal) {
    alert("Savings goal not found.");
    closeAddSavingsModal();
    return;
  }

  if (isNaN(depositAmount) || depositAmount <= 0) {
    alert("Please enter a valid deposit amount greater than zero.");
    depositAmountInput.focus();
    return;
  }

  const remainingNeeded = Math.round((goal.targetAmount - goal.savedAmount) * 100) / 100;

  if (depositAmount > remainingNeeded) {
    alert(`Deposit of ${formatIndianCurrency(depositAmount)} exceeds the remaining needed (${formatIndianCurrency(remainingNeeded)}). You only need ${formatIndianCurrency(remainingNeeded)} to complete this goal!`);
    depositAmountInput.focus();
    return;
  }

  const depositSubmitBtn = addSavingsForm ? addSavingsForm.querySelector("button[type='submit']") : null;
  const originalBtnText = depositSubmitBtn ? depositSubmitBtn.textContent : "Deposit Savings";

  const token = getAuthToken();
  const user = getCurrentUser();

  if (token && user) {
    if (!isBackendConfigured()) {
      showConfigError("add savings deposit");
      return;
    }

    if (depositSubmitBtn) {
      depositSubmitBtn.disabled = true;
      depositSubmitBtn.textContent = "⏳ Depositing...";
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/goals/${stringId}/add-savings`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ amount: depositAmount })
      });

      if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        handleAuthError(errData.message || "Access denied. Please log in to access this resource.");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`⚠️ Failed to add savings deposit: ${data.message || "Server error"}`);
        return;
      }

      if (data.data) {
        const index = savingsGoals.findIndex((g) => String(g.id || g._id) === stringId);
        if (index !== -1) {
          savingsGoals[index] = {
            id: String(data.data._id || data.data.id || stringId),
            _id: String(data.data._id || data.data.id || stringId),
            name: data.data.name,
            targetAmount: Number(data.data.targetAmount),
            savedAmount: Number(data.data.savedAmount),
            targetDate: data.data.targetDate,
            description: data.data.description,
            isCompleted: data.data.isCompleted,
            completedAt: data.data.completedAt,
            createdAt: data.data.createdAt
          };
        }
      }

      saveSavingsGoals();
      renderGoals();
      closeAddSavingsModal();

      if (data.data && data.data.isCompleted) {
        alert(`🎉 CONGRATULATIONS! You have successfully achieved your savings goal: "${goal.name}" (${formatIndianCurrency(goal.targetAmount)})! 🏆`);
      } else {
        const currentSaved = data.data ? data.data.savedAmount : goal.savedAmount + depositAmount;
        const newRemaining = Math.max(goal.targetAmount - currentSaved, 0);
        const newPercent = Math.round((currentSaved / goal.targetAmount) * 100);
        alert(`Added ${formatIndianCurrency(depositAmount)} to "${goal.name}". You are now ${newPercent}% of the way there (${formatIndianCurrency(newRemaining)} left to save)!`);
      }
    } catch (error) {
      console.error("Deposit goal error:", error);
      alert("⚠️ Network error: Cannot reach the backend server to deposit savings.");
    } finally {
      if (depositSubmitBtn) {
        depositSubmitBtn.disabled = false;
        depositSubmitBtn.textContent = originalBtnText;
      }
    }
  } else {
    alert("⚠️ Access denied. Please log in to deposit savings into your goals.");
    openAuthModal("login");
  }
}

/**
 * Calculates a friendly display string and badge for time remaining until target date
 */
function getGoalTimeRemaining(targetDateStr, isCompleted) {
  if (isCompleted) {
    return `<span class="days-pill completed-pill">🏆 Achieved</span>`;
  }
  if (!targetDateStr) return "";

  const parts = targetDateStr.split("-");
  if (parts.length !== 3) return "";

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);

  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return `<span class="days-pill">${diffDays} days left</span>`;
  } else if (diffDays === 1) {
    return `<span class="days-pill warning-pill">1 day left</span>`;
  } else if (diffDays === 0) {
    return `<span class="days-pill warning-pill">Due today</span>`;
  } else {
    return `<span class="days-pill overdue-pill">${Math.abs(diffDays)} days past target</span>`;
  }
}

/**
 * Renders all Savings Goals cards and top overview metrics
 */
function renderGoals() {
  // 1. Calculate Summary Metrics
  let totalTarget = 0;
  let totalSaved = 0;
  let completedCount = 0;

  savingsGoals.forEach((goal) => {
    totalTarget += Number(goal.targetAmount) || 0;
    totalSaved += Number(goal.savedAmount) || 0;
    if (goal.isCompleted) completedCount++;
  });

  // 2. Update Overview Cards in UI
  if (goalsTotalCountDisplay) goalsTotalCountDisplay.textContent = savingsGoals.length;
  if (goalsTotalTargetDisplay) goalsTotalTargetDisplay.textContent = formatIndianCurrency(totalTarget);
  if (goalsTotalSavedDisplay) goalsTotalSavedDisplay.textContent = formatIndianCurrency(totalSaved);
  if (goalsCompletedCountDisplay) goalsCompletedCountDisplay.textContent = completedCount;

  // 3. Render Savings Goals Cards
  if (!savingsGoalsList) return;

  savingsGoalsList.innerHTML = "";

  if (savingsGoals.length === 0) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "reports-empty-card";
    emptyCard.innerHTML = `
      <div class="empty-icon">🎯</div>
      <h3>No Savings Goals Created Yet</h3>
      <p>Set a target amount and milestone date on the left to start tracking your savings dreams with visual milestones.</p>
    `;
    savingsGoalsList.appendChild(emptyCard);
    return;
  }

  savingsGoals.forEach((goal) => {
    const safeGoalId = escapeHTML(String(goal.id || goal._id || ""));
    const target = Number(goal.targetAmount) || 0;
    const saved = Number(goal.savedAmount) || 0;
    const remaining = Math.max(target - saved, 0);
    const percent = target > 0 ? Math.round((saved / target) * 100) : 0;
    const cappedPercent = Math.min(percent, 100);

    const isCompleted = goal.isCompleted || saved >= target;
    const timeRemainingHtml = getGoalTimeRemaining(goal.targetDate, isCompleted);

    let statusBadgeHtml;
    let progressBarClass;

    if (isCompleted) {
      statusBadgeHtml = `<span class="badge badge-success">🎉 Goal Achieved!</span>`;
      progressBarClass = "progress-success";
    } else if (percent >= 80) {
      statusBadgeHtml = `<span class="badge badge-warning">🔥 ${percent}% (Almost There!)</span>`;
      progressBarClass = "progress-warning";
    } else {
      statusBadgeHtml = `<span class="badge badge-normal">🌱 ${percent}% In Progress</span>`;
      progressBarClass = "progress-normal";
    }

    const card = document.createElement("div");
    card.className = `savings-goal-card ${isCompleted ? "goal-completed-card" : ""}`;

    card.innerHTML = `
      <div class="goal-card-header">
        <div class="goal-title-group">
          <span class="goal-icon">${isCompleted ? "🏆" : "🎯"}</span>
          <div>
            <h3 class="goal-name">${escapeHTML(goal.name)}</h3>
            <div class="goal-date-badge">
              <span>📅 Target: ${escapeHTML(formatDateDisplay(goal.targetDate))}</span>
              ${timeRemainingHtml}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${statusBadgeHtml}
          <div class="tx-actions">
            <button 
              type="button" 
              class="action-btn edit-btn" 
              data-action="edit-goal" 
              data-id="${safeGoalId}" 
              title="Edit Goal" 
              aria-label="Edit goal"
            >✏️</button>
            <button 
              type="button" 
              class="action-btn delete-btn" 
              data-action="delete-goal" 
              data-id="${safeGoalId}" 
              title="Delete Goal" 
              aria-label="Delete goal"
            >&times;</button>
          </div>
        </div>
      </div>

      ${goal.description ? `<p class="goal-description-text">${escapeHTML(goal.description)}</p>` : ""}

      <div class="goal-metrics-row">
        <div class="goal-metric-col">
          <span class="goal-metric-label">Saved</span>
          <span class="goal-metric-val income-text">${formatIndianCurrency(saved)}</span>
        </div>
        <div class="goal-metric-col">
          <span class="goal-metric-label">Target</span>
          <span class="goal-metric-val">${formatIndianCurrency(target)}</span>
        </div>
        <div class="goal-metric-col">
          <span class="goal-metric-label">Remaining</span>
          <span class="goal-metric-val ${remaining <= 0 ? "income-text" : "expense-text"}">
            ${remaining <= 0 ? "₹0.00 (Done!)" : formatIndianCurrency(remaining)}
          </span>
        </div>
      </div>

      <div class="progress-wrapper" style="margin: 6px 0 2px;">
        <div class="progress-header">
          <span class="progress-title" style="font-size: 0.8rem; font-weight: 700;">Goal Progress</span>
          <span class="progress-percent" style="font-size: 0.82rem; font-weight: 800; color: ${isCompleted ? "var(--income-green)" : "var(--primary-purple)"};">${percent}%</span>
        </div>
        <div class="progress-track" style="height: 10px;">
          <div class="progress-bar ${progressBarClass}" style="width: ${cappedPercent}%;"></div>
        </div>
      </div>

      <div class="goal-card-footer">
        ${isCompleted 
          ? `<div class="goal-completed-banner"><span>🎉</span> <strong>Goal Achieved!</strong> You successfully reached your target of ${formatIndianCurrency(target)}.</div>` 
          : `<button type="button" class="btn-add-savings" data-action="add-savings" data-id="${safeGoalId}">➕ Add Savings</button>`
        }
      </div>
    `;

    savingsGoalsList.appendChild(card);
  });
}

// Expose Goal Management functions globally for inline HTML event handlers
window.startEditGoal = startEditGoal;
window.deleteGoal = deleteGoal;
window.openAddSavingsModal = openAddSavingsModal;
window.closeAddSavingsModal = closeAddSavingsModal;
window.renderGoals = renderGoals;

// ==========================================================================
// 14. USER AUTHENTICATION & MONGODB CLOUD SYNC ENGINE (Phase 5)
// ==========================================================================

/**
 * Attaches event listeners for User Authentication UI & Modals
 */
function setupAuthListeners() {
  if (openAuthModalBtn) {
    openAuthModalBtn.addEventListener("click", () => openAuthModal("login"));
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener("click", closeAuthModal);
  }

  if (authTabLogin) {
    authTabLogin.addEventListener("click", () => switchAuthTab("login"));
  }

  if (authTabRegister) {
    authTabRegister.addEventListener("click", () => switchAuthTab("register"));
  }

  if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchAuthTab("register");
    });
  }

  if (switchToLoginLink) {
    switchToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchAuthTab("login");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) {
        closeAuthModal();
        return;
      }

      // Password visibility toggle handling via event delegation (SEC-09 / Issue 3)
      const toggleBtn = e.target.closest(".password-toggle-btn");
      if (toggleBtn) {
        e.preventDefault();
        const targetId = toggleBtn.getAttribute("data-toggle-target");
        if (!targetId) return;

        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        const isPassword = targetInput.type === "password";
        targetInput.type = isPassword ? "text" : "password";

        const iconSpan = toggleBtn.querySelector(".password-toggle-icon");
        if (isPassword) {
          toggleBtn.setAttribute("aria-label", "Hide password");
          toggleBtn.setAttribute("title", "Hide password");
          toggleBtn.setAttribute("aria-pressed", "true");
          if (iconSpan) iconSpan.textContent = "🙈";
        } else {
          toggleBtn.setAttribute("aria-label", "Show password");
          toggleBtn.setAttribute("title", "Show password");
          toggleBtn.setAttribute("aria-pressed", "false");
          if (iconSpan) iconSpan.textContent = "👁️";
        }
      }
    });
  }

  // Close modal when pressing Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal && authModal.style.display !== "none") {
      closeAuthModal();
    }
  });

  // User Inactivity Tracking Listeners (SEC-07)
  ["mousedown", "keydown", "touchstart", "scroll"].forEach((evt) => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });
}

/**
 * Initializes authentication state from localStorage on page load (SEC-07)
 */
async function initAuthStatus() {
  try {
    const savedToken = getAuthToken();
    const user = getCurrentUser();

    if (savedToken && user) {
      authToken = savedToken;
      currentUser = user;
      updateAuthUI();
      resetInactivityTimer();
      console.log(`👤 Active User Session: ${currentUser.name} (${currentUser.email})`);

      // Load user's scoped cache first for instant render
      loadAllData();

      // If API URL is not configured or invalid, preserve dashboard rendering from cache and skip remote calls
      if (!isBackendConfigured()) {
        console.warn("⚠️ [SpendWise Config Warning]: API_URL is missing or invalid in config.js. Dashboard rendered from local cache; cloud synchronization skipped.");
        return;
      }

      // Fetch user's persistent transactions, budgets, and savings goals directly from MongoDB Atlas
      await fetchTransactionsFromCloud();
      await fetchBudgetsFromCloud();
      await fetchGoalsFromCloud();
    } else {
      // Unauthenticated Guest session
      authToken = null;
      currentUser = null;
      clearAuthStorage();
      updateAuthUI();
      loadAllData();
    }
  } catch (err) {
    console.error("Error reading stored user session:", err);
    authToken = null;
    currentUser = null;
    clearAuthStorage();
    updateAuthUI();
    loadAllData();
  }
}

/**
 * Updates navbar display based on current authentication state
 */
function updateAuthUI() {
  if (currentUser && authToken) {
    if (authLoggedOutBox) authLoggedOutBox.style.display = "none";
    if (authLoggedInBox) authLoggedInBox.style.display = "flex";
    if (userDisplayName) userDisplayName.textContent = currentUser.name;
    if (userAvatarInitial) {
      userAvatarInitial.textContent = (currentUser.name || "U").charAt(0).toUpperCase();
    }
  } else {
    if (authLoggedOutBox) authLoggedOutBox.style.display = "flex";
    if (authLoggedInBox) authLoggedInBox.style.display = "none";
  }
}

/**
 * Resets all password visibility toggle buttons and reverts inputs to type="password" (SEC-09)
 */
function resetPasswordVisibility() {
  const toggleBtns = document.querySelectorAll("#auth-modal .password-toggle-btn");
  toggleBtns.forEach((btn) => {
    const targetId = btn.getAttribute("data-toggle-target");
    if (targetId) {
      const input = document.getElementById(targetId);
      if (input && input.type === "text") {
        input.type = "password";
      }
    }
    btn.setAttribute("aria-label", "Show password");
    btn.setAttribute("title", "Show password");
    btn.setAttribute("aria-pressed", "false");
    const iconSpan = btn.querySelector(".password-toggle-icon");
    if (iconSpan) iconSpan.textContent = "👁️";
  });
}

/**
 * Opens the Authentication Modal in either "login" or "register" mode
 * @param {string} tab - "login" | "register"
 */
function openAuthModal(tab = "login") {
  if (!authModal) return;
  hideAuthAlert();
  resetPasswordVisibility();
  switchAuthTab(tab);
  authModal.style.display = "flex";
  authModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    if (tab === "login" && loginEmailInput) loginEmailInput.focus();
    if (tab === "register" && registerNameInput) registerNameInput.focus();
  }, 50);
}

/**
 * Closes the Authentication Modal and resets form fields
 */
function closeAuthModal() {
  if (!authModal) return;
  authModal.style.display = "none";
  authModal.setAttribute("aria-hidden", "true");
  hideAuthAlert();
  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();
  resetPasswordVisibility();
}

/**
 * Switches between Login and Register tabs within the modal
 * @param {string} tab - "login" | "register"
 */
function switchAuthTab(tab) {
  hideAuthAlert();
  resetPasswordVisibility();

  const titleEl = document.getElementById("auth-modal-title");
  const subtitleEl = document.getElementById("auth-modal-subtitle");

  if (tab === "register") {
    if (authTabRegister) {
      authTabRegister.classList.add("active");
      authTabRegister.setAttribute("aria-selected", "true");
    }
    if (authTabLogin) {
      authTabLogin.classList.remove("active");
      authTabLogin.setAttribute("aria-selected", "false");
    }
    if (loginForm) loginForm.style.display = "none";
    if (registerForm) registerForm.style.display = "block";
    if (titleEl) titleEl.textContent = "Create an Account";
    if (subtitleEl) subtitleEl.textContent = "Join SpendWise to secure your financial records";
    if (registerNameInput) registerNameInput.focus();
  } else {
    if (authTabLogin) {
      authTabLogin.classList.add("active");
      authTabLogin.setAttribute("aria-selected", "true");
    }
    if (authTabRegister) {
      authTabRegister.classList.remove("active");
      authTabRegister.setAttribute("aria-selected", "false");
    }
    if (registerForm) registerForm.style.display = "none";
    if (loginForm) loginForm.style.display = "block";
    if (titleEl) titleEl.textContent = "Log In to SpendWise";
    if (subtitleEl) subtitleEl.textContent = "Access your cloud-synced expense records";
    if (loginEmailInput) loginEmailInput.focus();
  }
}

/**
 * Displays an error or success alert box inside the auth modal
 * @param {string} message - Message text to display
 * @param {boolean} isSuccess - True for green success box, false for red error box
 */
function showAuthAlert(message, isSuccess = false) {
  if (!authAlertBox || !authAlertText) return;
  authAlertText.textContent = message;
  if (authAlertIcon) authAlertIcon.textContent = isSuccess ? "✅" : "⚠️";

  if (isSuccess) {
    authAlertBox.classList.add("success");
  } else {
    authAlertBox.classList.remove("success");
  }

  authAlertBox.style.display = "flex";
}

/**
 * Hides the alert box inside the auth modal
 */
function hideAuthAlert() {
  if (authAlertBox) {
    authAlertBox.style.display = "none";
  }
}

/**
 * Handles User Registration Form Submission
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();
  hideAuthAlert();

  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();
  const password = registerPasswordInput.value;
  const confirmPassword = registerConfirmPasswordInput.value;

  // 1. Client-side Form Validations
  if (!name || !email || !password || !confirmPassword) {
    showAuthAlert("Please fill in all required fields.");
    return;
  }

  if (password.length < 6) {
    showAuthAlert("Password must be at least 6 characters long.");
    registerPasswordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    showAuthAlert("Passwords do not match. Please verify and re-enter.");
    registerConfirmPasswordInput.focus();
    return;
  }

  // Guard against invalid or missing backend API configuration (SEC-FIND-01)
  if (!isBackendConfigured()) {
    showAuthAlert("⚠️ Cannot create account: The API server URL is not configured or invalid. Please check config.js.");
    console.error("❌ [SpendWise Config Error]: Registration aborted because BACKEND_API_URL is missing or invalid.");
    return;
  }

  // 2. Set button loading state
  if (registerSubmitBtn) {
    registerSubmitBtn.disabled = true;
    registerSubmitBtn.textContent = "Creating Account...";
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAuthAlert(data.message || "Registration failed. Please try again.");
      return;
    }

    // 3. Save Authentication Token & User Profile (canonical keys only - SEC-07)
    authToken = data.token;
    currentUser = {
      id: String(data.user.id || data.user._id),
      _id: String(data.user.id || data.user._id),
      name: data.user.name,
      email: data.user.email
    };
    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    purgeLegacyStorageKeys();

    updateAuthUI();
    resetInactivityTimer();
    closeAuthModal();

    // 4. Check for genuine guest transactions (never previously authenticated data - SEC-07)
    const guestTxRaw = localStorage.getItem("spendwise_guest_transactions");
    let guestTransactions = [];
    if (guestTxRaw) {
      try {
        guestTransactions = JSON.parse(guestTxRaw);
        if (!Array.isArray(guestTransactions)) guestTransactions = [];
      } catch (e) {
        guestTransactions = [];
      }
    }

    if (guestTransactions.length > 0) {
      const wantSync = confirm(`You have recorded ${guestTransactions.length} transaction(s) as a guest. Would you like to import them to your new MongoDB Atlas cloud account now?`);
      if (wantSync) {
        await syncGuestTransactionsToCloud(guestTransactions);
      }
      // Clean up guest transactions once handled
      localStorage.removeItem("spendwise_guest_transactions");
    }

    // Load current user's local cache immediately
    loadAllData();

    await fetchTransactionsFromCloud();
    await fetchBudgetsFromCloud();
    await fetchGoalsFromCloud();

    alert(`🎉 Account created successfully! Welcome to SpendWise, ${currentUser.name}!`);
  } catch (error) {
    console.error("Registration Network Error:", error);
    showAuthAlert("Cannot reach backend server. Please verify the API server is online and reachable.");
  } finally {
    if (registerSubmitBtn) {
      registerSubmitBtn.disabled = false;
      registerSubmitBtn.textContent = "✨ Create Account";
    }
  }
}

/**
 * Handles User Login Form Submission (SEC-07)
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  hideAuthAlert();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  // 1. Client-side Form Validation
  if (!email || !password) {
    showAuthAlert("Please provide both email and password.");
    return;
  }

  // Guard against invalid or missing backend API configuration (SEC-FIND-01)
  if (!isBackendConfigured()) {
    showAuthAlert("⚠️ Cannot log in: The API server URL is not configured or invalid. Please check config.js.");
    console.error("❌ [SpendWise Config Error]: Login aborted because BACKEND_API_URL is missing or invalid.");
    return;
  }

  // 2. Set button loading state
  if (loginSubmitBtn) {
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Logging In...";
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAuthAlert(data.message || "Invalid email or password. Please try again.");
      return;
    }

    // 3. Save Authentication Token & User Profile (canonical keys only - SEC-07)
    authToken = data.token;
    currentUser = {
      id: String(data.user.id || data.user._id),
      _id: String(data.user.id || data.user._id),
      name: data.user.name,
      email: data.user.email
    };
    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    purgeLegacyStorageKeys();

    updateAuthUI();
    resetInactivityTimer();
    closeAuthModal();

    // 4. Load current user's local cache immediately before cloud sync
    loadAllData();

    // 5. Fetch the authenticated user's transactions, budgets, and savings goals from MongoDB Atlas
    await fetchTransactionsFromCloud();
    await fetchBudgetsFromCloud();
    await fetchGoalsFromCloud();

    alert(`Welcome back to SpendWise, ${currentUser.name}! 👋`);
  } catch (error) {
    console.error("Login Network Error:", error);
    showAuthAlert("Cannot reach backend server. Please verify the API server is online and reachable.");
  } finally {
    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = "🔐 Log In";
    }
  }
}

/**
 * Handles User Logout: clears session and private data to ensure complete isolation (SEC-07)
 */
function handleLogout() {
  const confirmed = confirm("Are you sure you want to log out of SpendWise?");
  if (!confirmed) return;

  // 1. Stop inactivity timer
  stopInactivityTimer();

  // 2. Clear authentication token and profile from memory and storage
  authToken = null;
  currentUser = null;
  clearAuthStorage();

  // 3. Clear private transactions, budgets, and savings goals from memory immediately
  transactions = [];
  overallBudget = 0;
  categoryBudgets = [];
  savingsGoals = [];

  // 4. Load guest data (or blank state) and re-render all views
  loadAllData();

  // 5. Update navbar to logged-out state
  updateAuthUI();

  alert("You have been logged out. Your private session has ended.");
}

/**
 * Fetches all transactions belonging to the authenticated user from MongoDB Atlas (SEC-07)
 */
async function fetchTransactionsFromCloud() {
  const token = getAuthToken();
  if (!token) return;

  if (!isBackendConfigured()) {
    console.warn("⚠️ [SpendWise Config Warning]: Cannot fetch transactions from cloud because BACKEND_API_URL is missing or invalid.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/transactions`, {
      method: "GET",
      headers: getAuthHeaders(false)
    });

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      handleAuthError(errData.message || "Your session has expired. Please log in again.");
      return;
    }

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.data)) {
      transactions = data.data.map((tx) => ({
        id: String(tx._id || tx.id),
        _id: String(tx._id || tx.id),
        description: tx.description,
        amount: Number(tx.amount),
        type: tx.type,
        category: tx.category,
        date: tx.date
      }));

      saveTransactions();
      renderAll();
      console.log(`☁️ Synced ${transactions.length} transaction(s) from MongoDB Atlas.`);
    } else {
      console.warn("Could not retrieve transactions from cloud:", data.message);
    }
  } catch (error) {
    console.error("Network error fetching transactions from MongoDB Atlas:", error);
  }
}

/**
 * Fetches the authenticated user's overall and category budgets from MongoDB Atlas (SEC-07)
 */
async function fetchBudgetsFromCloud() {
  const token = getAuthToken();
  if (!token) return;

  if (!isBackendConfigured()) {
    console.warn("⚠️ [SpendWise Config Warning]: Cannot fetch budgets from cloud because BACKEND_API_URL is missing or invalid.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/budgets`, {
      method: "GET",
      headers: getAuthHeaders(false)
    });

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      handleAuthError(errData.message || "Your session has expired. Please log in again.");
      return;
    }

    const data = await response.json();

    if (response.ok && data.success && data.data) {
      overallBudget = Number(data.data.overallMonthly) || 0;
      categoryBudgets = Array.isArray(data.data.categoryBudgets)
        ? data.data.categoryBudgets.map((b) => ({
            id: String(b._id || b.id),
            _id: String(b._id || b.id),
            category: b.category,
            amount: Number(b.amount)
          }))
        : [];

      saveOverallBudget();
      saveCategoryBudgets();
      renderBudgets();
      renderDashboardPreviews();
      console.log(`🎯 Synced budgets from MongoDB Atlas (Overall: ₹${overallBudget}, Categories: ${categoryBudgets.length}).`);
    } else {
      console.warn("Could not retrieve budgets from cloud:", data.message);
    }
  } catch (error) {
    console.error("Network error fetching budgets from MongoDB Atlas:", error);
  }
}

/**
 * Fetches all savings goals belonging to the authenticated user from MongoDB Atlas (SEC-07)
 */
async function fetchGoalsFromCloud() {
  const token = getAuthToken();
  if (!token) {
    console.log("No auth token available, skipping fetchGoalsFromCloud.");
    return;
  }

  if (!isBackendConfigured()) {
    console.warn("⚠️ [SpendWise Config Warning]: Cannot fetch savings goals from cloud because BACKEND_API_URL is missing or invalid.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/goals`, {
      method: "GET",
      headers: getAuthHeaders(false)
    });

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      handleAuthError(errData.message || "Your session has expired. Please log in again.");
      return;
    }

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.data)) {
      savingsGoals = data.data.map((g) => ({
        id: String(g._id || g.id),
        _id: String(g._id || g.id),
        name: g.name,
        targetAmount: Number(g.targetAmount),
        savedAmount: Number(g.savedAmount),
        targetDate: g.targetDate,
        description: g.description,
        isCompleted: Boolean(g.isCompleted),
        completedAt: g.completedAt,
        createdAt: g.createdAt
      }));

      saveSavingsGoals();
      renderGoals();
      console.log(`🎯 Synced ${savingsGoals.length} savings goal(s) from MongoDB Atlas.`);
    } else {
      console.warn("Could not retrieve savings goals from cloud:", data.message);
    }
  } catch (error) {
    console.error("Network error fetching savings goals from MongoDB Atlas:", error);
  }
}

/**
 * Syncs unauthenticated guest transactions to MongoDB Atlas upon account creation (SEC-07)
 */
async function syncGuestTransactionsToCloud(guestTransactionsList = transactions) {
  const token = getAuthToken();
  if (!token || !Array.isArray(guestTransactionsList) || guestTransactionsList.length === 0) return;

  if (!isBackendConfigured()) {
    console.warn("⚠️ [SpendWise Config Warning]: Cannot sync guest transactions because BACKEND_API_URL is missing or invalid.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/transactions/sync`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ transactions: guestTransactionsList })
    });

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      handleAuthError(errData.message || "Session expired during guest sync.");
      return;
    }

    const data = await response.json();
    if (response.ok && data.success) {
      alert(`☁️ ${data.message}`);
    } else {
      console.warn("Sync response:", data);
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
}

// Expose Auth & Cloud Sync functions globally for inline HTML event handlers & testing
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogout = handleLogout;
window.getAuthToken = getAuthToken;
window.getCurrentUser = getCurrentUser;
window.getAuthHeaders = getAuthHeaders;
window.handleAuthError = handleAuthError;
window.fetchTransactionsFromCloud = fetchTransactionsFromCloud;
window.fetchBudgetsFromCloud = fetchBudgetsFromCloud;
window.fetchGoalsFromCloud = fetchGoalsFromCloud;
window.syncGuestTransactionsToCloud = syncGuestTransactionsToCloud;
window.syncLocalTransactionsToCloud = syncGuestTransactionsToCloud; // backwards compatibility alias
window.getTxStorageKey = getTxStorageKey;
window.getOverallBudgetStorageKey = getOverallBudgetStorageKey;
window.getCategoryBudgetsStorageKey = getCategoryBudgetsStorageKey;
window.getGoalsStorageKey = getGoalsStorageKey;
window.resetInactivityTimer = resetInactivityTimer;
window.stopInactivityTimer = stopInactivityTimer;

// Expose State Getters for testing & inspection (SEC-07)
window.getTransactions = () => transactions;
window.getOverallBudget = () => overallBudget;
window.getCategoryBudgets = () => categoryBudgets;
window.getSavingsGoals = () => savingsGoals;

// Expose Theme functions globally
window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;



