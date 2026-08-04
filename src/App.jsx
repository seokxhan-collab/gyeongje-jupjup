import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { TrendingUp } from 'lucide-react'
import ThemeToggle from './components/ThemeToggle.jsx'
import SearchBar from './components/SearchBar.jsx'
import SiteNav from './components/SiteNav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import WeeklyReviewPage from './pages/WeeklyReviewPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'

export default function App() {
  const [search, setSearch] = useState('')

  return (
    <div className="site">
      <header className="site-topbar">
        <div className="site-container site-topbar-inner">
          <div className="site-brand">
            <span className="site-brand-mark">
              <TrendingUp size={20} strokeWidth={2.5} />
            </span>
            <div>
              <h1>경제줍줍</h1>
              <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
            </div>
          </div>
          <div className="site-topbar-search">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <SiteNav />

      <Routes>
        <Route path="/" element={<HomePage search={search} />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/weekly" element={<WeeklyReviewPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>

      <Footer />
      <Analytics />
    </div>
  )
}
