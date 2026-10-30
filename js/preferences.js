/**
 * User preferences + localStorage persistence.
 * Day 46: habitStatusFilter + habitSortOption.
 */

const STORAGE_KEY = "dashboardPreferences";

const STATUS_FILTERS = new Set(["all", "completed", "remaining"]);
const SORT_OPTIONS = new Set(["default", "az", "completed", "remaining"]);

export const defaultPreferences = {
  temperatureUnit: "celsius",
  compactMode: false,
  theme: "light",
  codingGoalMinutes: 60,
  weatherLocation: {
    name: "Rome",
    latitude: 41.9,
    longitude: 12.5,
  },
  habitStatusFilter: "all",
  goalStatusFilter: "all",
  goalSortOption: "default",
  habitSortOption: "default",
};

let preferences = {
  ...defaultPreferences,
  weatherLocation: { ...defaultPreferences.weatherLocation },
};

function normalizeTemperatureUnit(value) {
  return value === "fahrenheit" ? "fahrenheit" : "celsius";
}

function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

function normalizeCodingGoal(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 600) {
    return defaultPreferences.codingGoalMinutes;
  }
  return n;
}

/**
 * Strict location check (api.js + geocoding tests).
 * Invalid → null (does NOT fall back to Rome).
 */
export function sanitizeLocation(value) {
  if (!value || typeof value !== "object") return null;

  if (typeof value.name !== "string") return null;
  const name = value.name.trim();
  if (!name || name.length > 100) return null;

  if (typeof value.latitude !== "number" || !Number.isFinite(value.latitude)) {
    return null;
  }
  if (
    typeof value.longitude !== "number" ||
    !Number.isFinite(value.longitude)
  ) {
    return null;
  }
  if (value.latitude < -90 || value.latitude > 90) return null;
  if (value.longitude < -180 || value.longitude > 180) return null;

  return {
    name,
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

function normalizeWeatherLocation(value) {
  return (
    sanitizeLocation(value) || {
      ...defaultPreferences.weatherLocation,
    }
  );
}

function normalizeStatusFilter(value) {
  return STATUS_FILTERS.has(value) ? value : "all";
}

function normalizeSortOption(value) {
  return SORT_OPTIONS.has(value) ? value : "default";
}

/** Used by backup-logic.js and tests */
export function sanitizePreferences(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    temperatureUnit: normalizeTemperatureUnit(src.temperatureUnit),
    compactMode: src.compactMode === true,
    theme: normalizeTheme(src.theme),
    codingGoalMinutes: normalizeCodingGoal(src.codingGoalMinutes),
    weatherLocation: normalizeWeatherLocation(src.weatherLocation),
    habitStatusFilter: normalizeStatusFilter(src.habitStatusFilter),
    goalStatusFilter: normalizeStatusFilter(src.goalStatusFilter),
    goalSortOption: ["default", "az", "remaining"].includes(src.goalSortOption)
      ? src.goalSortOption : "default",
    habitSortOption: normalizeSortOption(src.habitSortOption),
  };
}

export function normalizePreferences(raw) {
  return sanitizePreferences(raw);
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      preferences = sanitizePreferences({});
      return getPreferences();
    }
    preferences = sanitizePreferences(JSON.parse(raw));
  } catch {
    preferences = sanitizePreferences({});
  }
  return getPreferences();
}

export function getPreferences() {
  return {
    ...preferences,
    weatherLocation: { ...preferences.weatherLocation },
  };
}

export function savePreferences(partial) {
  preferences = sanitizePreferences({
    ...preferences,
    ...partial,
    weatherLocation:
      partial.weatherLocation !== undefined
        ? partial.weatherLocation
        : preferences.weatherLocation,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  return getPreferences();
}

export function replacePreferences(raw) {
  preferences = sanitizePreferences(raw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  applyPreferencesToUI();
  return getPreferences();
}

export function resetGoalViewPreferences() {
  return savePreferences({
    goalStatusFilter: defaultPreferences.goalStatusFilter,
    goalSortOption: defaultPreferences.goalSortOption,
  });
}

export function applyCompactMode() {
  document.body.classList.toggle("compact", preferences.compactMode);
}

export function applyTheme() {
  document.body.classList.toggle("dark", preferences.theme === "dark");
}

export function applyPreferencesToUI() {
  applyTheme();
  applyCompactMode();
}
