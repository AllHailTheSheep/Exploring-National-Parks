// TUNewsScraper.js
// Twitter/X scraper using Puppeteer with scrolling
// Returns only tweet text
// Usage: node TUNewsScraper.js 5

import puppeteer from "puppeteer";

const TWITTER_URL = "https://twitter.com/TempleUniv/";

// universal delay helper
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getTUNews(count = 5) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/118.0 Safari/537.36"
        );

        await page.goto(TWITTER_URL, { waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForSelector("article div[lang]", { timeout: 30000 });

        // Scroll several times to load more tweets
        const scrollTimes = 4;
        for (let i = 0; i < scrollTimes; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
            await delay(1500);
        }

        // Extract only the text of tweets
        const tweets = await page.$$eval("article div[lang]", (nodes) =>
            nodes.map((n) => n.innerText.trim())
        );

        // Deduplicate in case some tweets appear multiple times
        const seen = new Set();
        const uniqueTweets = [];
        for (const t of tweets) {
            if (!seen.has(t)) {
                uniqueTweets.push(t);
                seen.add(t);
            }
            if (uniqueTweets.length >= count) break;
        }

        return uniqueTweets;

    } finally {
        await browser.close();
    }
}

// CLI (just for testing really)
if (process.argv[1].endsWith("TUNewsScraper.js")) {
    const n = Number(process.argv[2] || "5");
    getTUNews(Number.isFinite(n) && n > 0 ? n : 5)
        .then((items) => console.log(JSON.stringify(items, null, 2)))
        .catch((err) => {
            console.error("Failed to fetch Temple University X news:", err.message);
            process.exit(1);
        });
}
