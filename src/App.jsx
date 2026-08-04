import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Bookmark } from 'lucide-react'
import Logo from './components/Logo.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SearchBar from './components/SearchBar.jsx'
import SiteNav from './components/SiteNav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import QuizArchivePage from './pages/QuizArchivePage.jsx'
import WeeklyReviewPage from './pages/WeeklyReviewPage.jsx'
import WeeklyArchivePage from './pages/WeeklyArchivePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import GlossaryPage from './pages/GlossaryPage.jsx'
import SubscribePage from './pages/SubscribePage.jsx'
import { useBookmarks } from './lib/useBookmarks.js'

export default function App() {
  const [search, setSearch] = useState('')
  const { bookmarks } = useBookmarks()

  return (
    <div className="site">
      <header className="site-topbar">
        <div className="site-container site-topbar-inner">
          <div className="site-brand">
            <Logo size={38} />
            <div>
              <h1>경제줍줍</h1>
              <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
            </div>
          </div>
          <div className="site-topbar-search">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Link to="/saved" className="saved-link" aria-label="저장한 기사">
            <Bookmark size={18} />
            {bookmarks.length > 0 && <span className="saved-link-badge">{bookmarks.length}</span>}
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <SiteNav />

      <Routes>
        <Route path="/" element={<HomePage search={search} />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/archive" element={<QuizArchivePage />} />
        <Route path="/quiz/:date" element={<QuizPage />} />
        <Route path="/weekly" element={<WeeklyReviewPage />} />
        <Route path="/weekly/archive" element={<WeeklyArchivePage />} />
        <Route path="/weekly/:date" element={<WeeklyReviewPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
      </Routes>

      <Footer />
      <Analytics />
    </div>
  )
}
