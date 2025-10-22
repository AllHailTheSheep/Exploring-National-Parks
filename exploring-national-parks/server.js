// Simple Express backend to serve TU news via Puppeteer scraper
// Endpoint: GET /api/tu-news?count=5
// This imports the Node-only scraper located in the React app source.

import express from 'express'
import cors from 'cors'

// Import the scraper (ESM)
import { getTUNews } from './src/TUNewsScraper.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/tu-news', async (req, res) => {
  const rawCount = Array.isArray(req.query.count) ? req.query.count[0] : req.query.count
  const n = Number(rawCount)
  const count = Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 20) : 5

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000) // 90s max
    // getTUNews does not accept signal, but keep future-proof structure
    const items = await getTUNews(count)
    clearTimeout(timeout)
    res.json(items)
  } catch (err) {
    console.error('[tu-news] Failed:', err?.message || err)
    res.status(502).json({ error: 'Failed to fetch Temple University news' })
  }
})

app.listen(PORT, () => {
  console.log(`TU News backend listening on http://localhost:${PORT}`)
})
