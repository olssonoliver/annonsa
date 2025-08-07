export default async function loadCheerio(html) {
  const cheerioModule = await import("cheerio");
  const cheerio = cheerioModule.default;
  return cheerio.load(html);
}
