import { useEffect, useRef, useState } from 'react'

const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true'

// 카카오애드핏(https://adfit.kakao.com)에서 사이트를 등록하고 발급받은 광고단위 코드를
// .env(.local)에 아래 이름으로 넣으면 해당 슬롯에 광고가 노출된다. 값이 비어있으면 해당 슬롯은 렌더링되지 않는다.
const AD_UNITS = {
  bannerDesktop: { id: import.meta.env.VITE_ADFIT_UNIT_BANNER_DESKTOP, width: 728, height: 90 },
  bannerMobile: { id: import.meta.env.VITE_ADFIT_UNIT_BANNER_MOBILE, width: 320, height: 100 },
  rectangle: { id: import.meta.env.VITE_ADFIT_UNIT_RECTANGLE, width: 300, height: 250 },
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

// 카카오애드핏 로더(ba.min.js)는 로드되는 시점에 페이지에 있는 .kakao_ad_area를 스캔해서 채운다.
// SPA에서 슬롯이 뒤늦게(라우팅/조건부 렌더링으로) 마운트되면 스캔을 놓치므로,
// 슬롯이 마운트될 때마다 스크립트 태그를 새로 삽입해 재스캔을 유도한다.
function KakaoAdUnit({ unit }) {
  const insRef = useRef(null)

  useEffect(() => {
    if (!unit?.id || !insRef.current) return
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
    script.async = true
    insRef.current.parentElement.appendChild(script)
    return () => script.remove()
  }, [unit?.id])

  return (
    <ins
      ref={insRef}
      className="kakao_ad_area"
      style={{ display: 'none' }}
      data-ad-unit={unit.id}
      data-ad-width={String(unit.width)}
      data-ad-height={String(unit.height)}
    />
  )
}

export default function AdSlot({ placement }) {
  const isDesktop = useIsDesktop()

  if (!ADS_ENABLED) return null

  if (placement === 'top-banner') {
    const unit = isDesktop ? AD_UNITS.bannerDesktop : AD_UNITS.bannerMobile
    if (!unit.id) return null
    return (
      <div className="ad-slot ad-slot--top-banner">
        <span className="ad-slot-label">광고</span>
        <KakaoAdUnit key={isDesktop ? 'desktop' : 'mobile'} unit={unit} />
      </div>
    )
  }

  const unit = AD_UNITS.rectangle
  if (!unit.id) return null

  return (
    <div className={`ad-slot ad-slot--${placement}`}>
      <span className="ad-slot-label">광고</span>
      <KakaoAdUnit unit={unit} />
    </div>
  )
}
