import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'econ-news-bookmarks'

function readBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeBookmarks(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('econ-news-bookmarks-change'))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(readBookmarks)

  useEffect(() => {
    function sync() {
      setBookmarks(readBookmarks())
    }
    window.addEventListener('econ-news-bookmarks-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('econ-news-bookmarks-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isBookmarked = useCallback((id) => bookmarks.some((b) => b.id === id), [bookmarks])

  const toggleBookmark = useCallback((item) => {
    const current = readBookmarks()
    const exists = current.some((b) => b.id === item.id)
    const next = exists ? current.filter((b) => b.id !== item.id) : [{ ...item, saved_at: new Date().toISOString() }, ...current]
    writeBookmarks(next)
    setBookmarks(next)
  }, [])

  return { bookmarks, isBookmarked, toggleBookmark }
}
