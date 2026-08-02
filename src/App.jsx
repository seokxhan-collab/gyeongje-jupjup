import DailyBriefing from './components/DailyBriefing.jsx'
import NewsFeed from './components/NewsFeed.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>경제줍줍</h1>
          <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
        </div>
        <ThemeToggle />
      </header>
      <DailyBriefing />
      <NewsFeed />
    </div>
  )
}
