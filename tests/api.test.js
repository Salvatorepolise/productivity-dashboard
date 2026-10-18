import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseQuote,
  parseWeather,
  getWeatherDescription,
  convertTemperature,
  parseGeocoding,
} from "../js/api.js";

// ===== Quote =====

test("parseQuote accepts a valid response", () => {
  assert.deepEqual(parseQuote({ quote: " Ship it. ", author: "Me " }), {
    quote: "Ship it.",
    author: "Me",
  });
});

test("parseQuote rejects unexpected responses", () => {
  for (const data of [null, {}, { quote: "" }, { quote: "x" }, { quote: 1, author: "a" }]) {
    assert.throws(() => parseQuote(data), /Unexpected quote response/);
  }
});

// ===== Weather =====

test("parseWeather reads Open-Meteo's current block", () => {
  const data = { current: { temperature_2m: 18.4, weather_code: 3 } };
  assert.deepEqual(parseWeather(data), {
    temperature: 18.4,
    weatherCode: 3,
    description: "Partly cloudy",
  });
});

test("parseWeather accepts 0 °C and code 0", () => {
  const data = { current: { temperature_2m: 0, weather_code: 0 } };
  assert.equal(parseWeather(data).description, "Clear sky");
});

test("parseWeather rejects missing or wrong fields", () => {
  const bad = [
    null,
    {},
    { current: {} },
    { current: { temperature_2m: "18", weather_code: 3 } },
    { current: { temperature_2m: 18, weather_code: null } },
    { current: { temperature_2m: NaN, weather_code: 3 } },
  ];
  for (const data of bad) {
    assert.throws(() => parseWeather(data), /Unexpected weather response/);
  }
});

test("getWeatherDescription covers the WMO code groups", () => {
  assert.equal(getWeatherDescription(0), "Clear sky");
  assert.equal(getWeatherDescription(2), "Partly cloudy");
  assert.equal(getWeatherDescription(48), "Foggy");
  assert.equal(getWeatherDescription(53), "Drizzle");
  assert.equal(getWeatherDescription(63), "Rain");
  assert.equal(getWeatherDescription(75), "Snow");
  assert.equal(getWeatherDescription(81), "Rain showers");
  assert.equal(getWeatherDescription(86), "Snow showers");
  assert.equal(getWeatherDescription(95), "Thunderstorm");
  assert.equal(getWeatherDescription(42), "Unknown conditions");
});

test("convertTemperature rounds and converts to °F", () => {
  assert.equal(convertTemperature(18.4, "celsius"), 18);
  assert.equal(convertTemperature(0, "fahrenheit"), 32);
  assert.equal(convertTemperature(100, "fahrenheit"), 212);
  assert.equal(convertTemperature(-40, "fahrenheit"), -40);
});

// ===== City search (Day 41) =====

test("parseGeocoding returns the first result with its country", () => {
  const data = {
    results: [
      { name: "Milan", country: "Italy", latitude: 45.46, longitude: 9.19 },
      { name: "Milan", country: "United States", latitude: 42.08, longitude: -83.68 },
    ],
  };
  assert.deepEqual(parseGeocoding(data), {
    name: "Milan, Italy",
    latitude: 45.46,
    longitude: 9.19,
  });
});

test("parseGeocoding works without a country", () => {
  const data = { results: [{ name: "Atlantis", latitude: 0, longitude: 0 }] };
  assert.equal(parseGeocoding(data).name, "Atlantis");
});

test("parseGeocoding returns null when the city is not found", () => {
  // Open-Meteo omits "results" when nothing matches
  assert.equal(parseGeocoding({ generationtime_ms: 0.5 }), null);
  assert.equal(parseGeocoding({ results: [] }), null);
});

test("parseGeocoding rejects broken responses", () => {
  assert.throws(() => parseGeocoding(null), /Unexpected geocoding response/);
  assert.throws(
    () => parseGeocoding({ results: [{ name: "X", latitude: "45", longitude: 9 }] }),
    /Unexpected geocoding response/,
  );
  assert.throws(
    () => parseGeocoding({ results: [{ name: "X", latitude: 200, longitude: 9 }] }),
    /Unexpected geocoding response/,
  );
});
