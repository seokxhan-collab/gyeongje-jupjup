export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer-inner">
        <div className="site-footer-brand">경제줍줍</div>
        <p className="site-footer-tagline">국내외 경제뉴스를 한 곳에 모아봅니다</p>
        <p className="site-footer-disclaimer">
          본 서비스가 제공하는 브리핑은 AI가 원문을 재구성해 요약한 내용으로, 투자 판단의 참고용으로만 활용하시기 바랍니다.
        </p>
        <p className="site-footer-contact">
          문의 및 광고 제휴: <a href="mailto:honeyhavenlab0@gmail.com">honeyhavenlab0@gmail.com</a>
        </p>
        <p className="site-footer-copyright">© {new Date().getFullYear()} 경제줍줍</p>
      </div>
    </footer>
  )
}
