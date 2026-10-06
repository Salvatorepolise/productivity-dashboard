/**
 * UserPreferences:
 * {
 *   temperatureUnit: "celsius" | "fahrenheit",
 *   compactMode: boolean,
 *   theme: "light" | "dark"
 * }
 */

export const defaultPreferences = {
  temperatureUnit: "celsius",
  compactMode: false,
  theme: "light",
};

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
    const parsed = JSON.parse(saved);
    preferences = {
      ...defaultPreferences,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load preferences:", error);
    preferences = { ...defaultPreferences };
  }

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
