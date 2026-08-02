import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'theme'

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="테마 전환" title="화이트/다크 모드 전환">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
