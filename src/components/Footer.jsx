import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer-inner">
        <div className="site-footer-col site-footer-about">
          <div className="site-footer-brand">경제줍줍</div>
          <p className="site-footer-tagline">국내 경제뉴스를 한 곳에 모아봅니다</p>
          <p className="site-footer-disclaimer">
            본 서비스가 제공하는 브리핑은 AI가 원문을 재구성해 요약한 내용으로, 투자 판단의 참고용으로만 활용하시기 바랍니다.
          </p>
        </div>

        <div className="site-footer-col">
          <h5 className="site-footer-heading">바로가기</h5>
          <nav className="site-footer-links">
            <Link to="/">홈</Link>
            <Link to="/calendar">경제 캘린더</Link>
            <Link to="/subscribe">브리핑 구독</Link>
          </nav>
        </div>

        <div className="site-footer-col">
          <h5 className="site-footer-heading">정책</h5>
          <nav className="site-footer-links">
            <Link to="/about">사이트 소개</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </nav>
        </div>

        <div className="site-footer-col">
          <h5 className="site-footer-heading">문의</h5>
          <p className="site-footer-contact">
            문의 및 광고 제휴
            <br />
            <a href="mailto:honeyhavenlab0@gmail.com">honeyhavenlab0@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="site-container site-footer-bottom">
        <p className="site-footer-copyright">© {new Date().getFullYear()} 경제줍줍</p>
      </div>
    </footer>
  )
}
