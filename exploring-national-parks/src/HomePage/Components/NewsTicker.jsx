import React, { useEffect, useState, useMemo } from 'react'

/**
 * NewsTicker component
 * - Shows a loading message ("fetching news…") while waiting for news items
 * - Once loaded, displays a horizontally scrolling ticker of news strings
 * - Attempts to fetch news from a backend endpoint (e.g., /api/tu-news)
 *   that should internally use TUNewsScraper to get the items.
 *
 * Note: TUNewsScraper uses Puppeteer (Node-only). Do not import it directly in the browser bundle.
 */
const API_BASE = 'http://localhost:4000'

const NewsTicker = ({ count = 5 }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

    useEffect(() => {
        let aborted = false

        async function load() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch('http://localhost:4000/api/tu-news?count=' + count)
                const data = await res.json()
                if (!aborted && Array.isArray(data)) {
                    setItems(data)
                }
            } catch (e) {
                if (!aborted) console.error(e) // log error instead of immediately setting error
            } finally {
                if (!aborted) setLoading(false)
            }
        }

        load()
        return () => { aborted = true }
    }, [count])


  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="news-ticker__loading">Fetching news (this could take some time)…</div>
      )
    }
    if (error) {
      return (
        <div className="news-ticker__error">Unable to load TU news right now.</div>
      )
    }
    if (!items || items.length === 0) {
      return (
        <div className="news-ticker__empty">No recent TU news available.</div>
      )
    }

    // Duplicate items to create a seamless loop in the marquee
    const loopItems = [...items, ...items]

    return (
      <div className="news-ticker__viewport" aria-label="Temple University news ticker">
        <div className="news-ticker__track">
          {loopItems.map((t, idx) => (
            <span key={idx} className="news-ticker__item">{t}</span>
          ))}
        </div>
      </div>
    )
  }, [loading, error, items])

  return (
    <div className="news-ticker">
      <div className="news-ticker__title">Temple University News</div>
      {content}
    </div>
  )
}

export default NewsTicker
