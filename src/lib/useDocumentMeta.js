import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = '경제줍줍'
const SITE_URL = 'https://gyeongje-jupjup.vercel.app'

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

// SPA는 모든 라우트가 같은 index.html을 서빙하므로, canonical/title/description을
// 라우트가 바뀔 때마다 갱신하지 않으면 검색엔진이 모든 페이지를 홈페이지의 중복으로 인식한다.
export function useDocumentMeta({ title, description, noindex = false }) {
  const location = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME
    const desc = description ?? '국내외 경제뉴스를 한 곳에 모아 보여주는 뉴스 모음 사이트.'
    const canonicalUrl = `${SITE_URL}${location.pathname}`

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('link[rel="canonical"]', 'href', canonicalUrl)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)

    let robotsTag = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', 'noindex')
    } else if (robotsTag) {
      robotsTag.remove()
    }
  }, [title, description, noindex, location.pathname])
}
