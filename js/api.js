export async function loadDailyQuote() {
  const quoteEl = document.getElementById("daily-quote");
  const authorEl = document.getElementById("quote-author");

  if (!quoteEl || !authorEl) return;

  quoteEl.textContent = "Loading quote...";
  authorEl.textContent = "";

  try {
    const response = await fetch("https://dummyjson.com/quotes/random");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    quoteEl.textContent = `"${data.quote}"`;
    authorEl.textContent = `— ${data.author}`;
  } catch (error) {
    console.error("Quote fetch failed:", error);
    quoteEl.textContent = "Could not load quote.";
    authorEl.textContent = "";
  }
}

/**
 * Weather model:
 * { temperature: number, weatherCode: number, description: string }
 *
 * Open-Meteo — no API key
 * Fixed location: Rome (approx)
 */

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown conditions";
}

/** API layer only — no DOM */
export async function getWeather() {
  const latitude = 41.9;
  const longitude = 12.5;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  const temperature = data.current.temperature_2m;
  const weatherCode = data.current.weather_code;

  return {
    temperature,
    weatherCode,
    description: getWeatherDescription(weatherCode),
  };
}

/** UI helpers */
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

  tempEl.textContent = `${weather.temperature}°C`;
  descEl.textContent = weather.description;
}

function renderWeatherError() {
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  if (!tempEl || !descEl) return;

  tempEl.textContent = "Could not load weather.";
  descEl.textContent = "";
}

/** Orchestration: loading → API → UI */
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