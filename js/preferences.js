/**
 * UserPreferences:
 * {
 *   temperatureUnit: "celsius" | "fahrenheit",
 *   compactMode: boolean,
 *   theme: "light" | "dark",
 *   codingGoalMinutes: number (Day 38),
 *   weatherLocation: { name, latitude, longitude } (Day 41)
 * }
 */

export const defaultPreferences = {
  temperatureUnit: "celsius",
  compactMode: false,
  theme: "light",
  codingGoalMinutes: 60,
  weatherLocation: { name: "Rome", latitude: 41.9, longitude: 12.5 },
};

/** Returns a clean { name, latitude, longitude } or null if invalid */
export function sanitizeLocation(raw) {
  if (!raw || typeof raw !== "object") return null;

  const { name, latitude, longitude } = raw;
  if (typeof name !== "string" || !name.trim() || name.length > 100) {
    return null;
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return null;
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return null;
  }

  return { name: name.trim(), latitude, longitude };
}

/** Keeps only known preference keys with valid values */
export function sanitizePreferences(raw) {
  const prefs = { ...defaultPreferences };
  if (!raw || typeof raw !== "object") return prefs;

  if (raw.temperatureUnit === "celsius" || raw.temperatureUnit === "fahrenheit") {
    prefs.temperatureUnit = raw.temperatureUnit;
  }
  if (typeof raw.compactMode === "boolean") {
    prefs.compactMode = raw.compactMode;
  }
  if (raw.theme === "light" || raw.theme === "dark") {
    prefs.theme = raw.theme;
  }
  if (
    Number.isInteger(raw.codingGoalMinutes) &&
    raw.codingGoalMinutes >= 1 &&
    raw.codingGoalMinutes <= 600
  ) {
    prefs.codingGoalMinutes = raw.codingGoalMinutes;
  }
  const location = sanitizeLocation(raw.weatherLocation);
  if (location) {
    prefs.weatherLocation = location;
  }

  return prefs;
}

let preferences = { ...defaultPreferences };

export function getPreferences() {
  return preferences;
}

export function loadPreferences() {
  const saved = localStorage.getItem("userPreferences");

  if (!saved) {
    preferences = { ...defaultPreferences };
    return preferences;
  }

  try {
    preferences = sanitizePreferences(JSON.parse(saved));
  } catch (error) {
    console.error("Failed to load preferences:", error);
    preferences = { ...defaultPreferences };
  }

  return preferences;
}

/** Day 39: replace all preferences (backup import) */
export function replacePreferences(next) {
  preferences = sanitizePreferences(next);
  localStorage.setItem("userPreferences", JSON.stringify(preferences));
  return preferences;
}

export function savePreferences(next) {
  preferences = {
    ...preferences,
    ...next,
  };
  localStorage.setItem("userPreferences", JSON.stringify(preferences));
  return preferences;
}

export function applyCompactMode() {
  document.body.classList.toggle("compact", preferences.compactMode);
}

export function applyTheme() {
  document.body.classList.toggle("dark", preferences.theme === "dark");
}

/** Apply all visual preferences after load */
export function applyPreferencesToUI() {
  applyCompactMode();
  applyTheme();
}
