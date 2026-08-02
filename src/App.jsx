import DailyBriefing from './components/DailyBriefing.jsx'
import NewsFeed from './components/NewsFeed.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>econ-news</h1>
        <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
      </header>
      <DailyBriefing />
      <NewsFeed />
    </div>
  )
}
