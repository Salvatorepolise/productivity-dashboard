import { getPreferences } from "./preferences.js";

// Day 40: never wait forever on a slow API
const REQUEST_TIMEOUT_MS = 8000;

async function fetchJSON(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/** Day 40: check the API response before using it */
export function parseQuote(data) {
  if (
    !data ||
    typeof data.quote !== "string" ||
    !data.quote.trim() ||
    typeof data.author !== "string"
  ) {
    throw new Error("Unexpected quote response");
  }
  return { quote: data.quote.trim(), author: data.author.trim() };
}

export async function loadDailyQuote() {
  const quoteEl = document.getElementById("daily-quote");
  const authorEl = document.getElementById("quote-author");

  if (!quoteEl || !authorEl) return;

  quoteEl.textContent = "Loading quote...";
  authorEl.textContent = "";

  try {
    const data = await fetchJSON("https://dummyjson.com/quotes/random");
    const { quote, author } = parseQuote(data);

    quoteEl.textContent = `"${quote}"`;
    authorEl.textContent = author ? `— ${author}` : "";
  } catch (error) {
    console.error("Quote fetch failed:", error);
    quoteEl.textContent = "Could not load quote.";
    authorEl.textContent = "";
  }
}

/**
 * Weather model (always stored in Celsius from API):
 * { temperature: number, weatherCode: number, description: string }
 */

let cachedWeather = null;

/** WMO weather codes used by Open-Meteo */
export function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown conditions";
}

/** Day 40: check the API response before using it */
export function parseWeather(data) {
  const temperature = data?.current?.temperature_2m;
  const weatherCode = data?.current?.weather_code;

  if (!Number.isFinite(temperature) || !Number.isInteger(weatherCode)) {
    throw new Error("Unexpected weather response");
  }

  return {
    temperature,
    weatherCode,
    description: getWeatherDescription(weatherCode),
  };
}

/** Pure conversion — API stays in °C */
export function convertTemperature(celsius, unit) {
  if (unit === "fahrenheit") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/** API layer only — no DOM */
const WEATHER_LOCATION = { name: "Rome", latitude: 41.9, longitude: 12.5 };

export async function getWeather() {
  const { latitude, longitude } = WEATHER_LOCATION;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code`;

  const weather = parseWeather(await fetchJSON(url));

  cachedWeather = weather;
  return weather;
}

function renderWeatherLoading() {
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  if (!tempEl || !descEl) return;

  tempEl.textContent = "Loading weather...";
  descEl.textContent = "";
}

function renderWeather(weather) {
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  if (!tempEl || !descEl) return;

  const { temperatureUnit } = getPreferences();
  const value = convertTemperature(weather.temperature, temperatureUnit);
  const symbol = temperatureUnit === "fahrenheit" ? "°F" : "°C";

  tempEl.textContent = `${value}${symbol}`;
  descEl.textContent = `${weather.description} · ${WEATHER_LOCATION.name}`;
}

function renderWeatherError() {
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  if (!tempEl || !descEl) return;

  tempEl.textContent = "Could not load weather.";
  descEl.textContent = "";
}

/** Re-render from cache when unit changes (no new API call) */
export function refreshWeatherDisplay() {
  if (cachedWeather) {
    renderWeather(cachedWeather);
  }
}

export async function loadWeather() {
  renderWeatherLoading();

  try {
    const weather = await getWeather();
    renderWeather(weather);
  } catch (error) {
    console.error("Weather fetch failed:", error);
    renderWeatherError();
  }
}
