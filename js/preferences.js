/**
 * User preferences + localStorage persistence.
 * Day 46: habitStatusFilter + habitSortOption.
 */

const STORAGE_KEY = "dashboardPreferences";

const STATUS_FILTERS = new Set(["all", "completed", "remaining"]);
const SORT_OPTIONS = new Set(["default", "az", "completed", "remaining"]);

const defaultPreferences = {
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
  habitSortOption: "default",
};

let preferences = { ...defaultPreferences };

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

function normalizeWeatherLocation(value) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.name !== "string" ||
    typeof value.latitude !== "number" ||
    typeof value.longitude !== "number"
  ) {
    return { ...defaultPreferences.weatherLocation };
  }
  return {
    name: value.name,
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

function normalizeStatusFilter(value) {
  return STATUS_FILTERS.has(value) ? value : "all";
}

function normalizeSortOption(value) {
  return SORT_OPTIONS.has(value) ? value : "default";
}

export function normalizePreferences(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    temperatureUnit: normalizeTemperatureUnit(src.temperatureUnit),
    compactMode: Boolean(src.compactMode),
    theme: normalizeTheme(src.theme),
    codingGoalMinutes: normalizeCodingGoal(src.codingGoalMinutes),
    weatherLocation: normalizeWeatherLocation(src.weatherLocation),
    habitStatusFilter: normalizeStatusFilter(src.habitStatusFilter),
    habitSortOption: normalizeSortOption(src.habitSortOption),
  };
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      preferences = { ...defaultPreferences };
      return getPreferences();
    }
    preferences = normalizePreferences(JSON.parse(raw));
  } catch {
    preferences = { ...defaultPreferences };
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
  preferences = normalizePreferences({
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
  preferences = normalizePreferences(raw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  applyPreferencesToUI();
  return getPreferences();
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
