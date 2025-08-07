// pages/api/tradera.js

import loadCheerio from "../../lib/loadCheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const url = `https://www.tradera.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });

    const status = response.status;
    const html = await response.text();

    console.log("Tradera response status:", status);
    console.log("Tradera response preview:", html.slice(0, 200));

    const $ = await loadCheerio(html);
    const items = [];

    $(".items__item").each((_, el) => {
      const title = $(el).find(".card__title").text().trim();
      const link = "https://www.tradera.com" + $(el).find("a").attr("href");
      const description = $(el).find(".card__subtitle").text().trim();
      const image = $(el).find("img").attr("src") || null;

      if (title && link) {
        items.push({ title, link, description: description || "Ingen beskrivning.", image });
      }
    });

    if (items.length === 0) {
      return res.status(200).json({
        debug: {
          status,
          preview: html.slice(0, 500)
        },
        results: [
          {
            title: "Inga annonser kunde hittas",
            description: "Försök med en annan sökterm eller kontrollera stavning.",
            link: "https://www.tradera.com",
            image: null
          }
        ]
      });
    }

    res.status(200).json({ results: items.slice(0, 10) });
  } catch (err) {
    console.error("Scraper error:", err);
    res.status(500).json({
      error: "Failed to scrape Tradera",
      debug: err.message,
      results: [
        {
          title: "Tekniskt fel",
          description: "Kunde inte hämta annonser just nu. Försök igen senare.",
          link: "https://www.tradera.com",
          image: null
        }
      ]
    });
  }
}
