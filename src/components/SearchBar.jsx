import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  const [input, setInput] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => onChange(input), 300)
    return () => clearTimeout(timer)
  }, [input, onChange])

  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="제목, 요약 검색"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {input && (
        <button
          type="button"
          className="search-clear"
          onClick={() => setInput('')}
          aria-label="검색어 지우기"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
