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
