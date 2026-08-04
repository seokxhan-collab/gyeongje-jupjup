import { useDocumentMeta } from '../lib/useDocumentMeta.js'

export default function PrivacyPage() {
  useDocumentMeta({
    title: '개인정보처리방침',
    description: '경제줍줍의 개인정보 수집·이용·광고 쿠키 관련 처리방침입니다.',
  })

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <h2 className="page-title">개인정보처리방침</h2>
        <span className="page-date">시행일 2026-08-05</span>
      </div>

      <article className="legal-article">
        <p>
          경제줍줍(이하 &apos;사이트&apos;)은 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수하기 위해
          다음과 같이 개인정보처리방침을 안내합니다.
        </p>

        <h3>1. 수집하는 개인정보 항목</h3>
        <p>
          사이트는 회원가입 없이 뉴스 열람, 검색, 퀴즈 참여 기능을 제공하며 이용자로부터 이름 등의 개인정보를
          직접 수집하지 않습니다. 다만 아래의 경우에는 이용자가 자발적으로 제공한 정보가 수집됩니다.
        </p>
        <ul>
          <li>문의 메일 발송 시: 이용자가 제공한 이메일 주소</li>
          <li>브리핑 이메일 구독 신청 시: 이용자가 입력한 이메일 주소</li>
          <li>브리핑 텔레그램 구독 신청 시: 텔레그램 채팅 식별값(chat ID)</li>
        </ul>

        <h3>2. 쿠키 및 광고·분석 서비스</h3>
        <p>
          사이트는 카카오 애드핏(Kakao AdFit) 광고와 Vercel Analytics 방문 통계 서비스를 이용하며, 이 과정에서
          쿠키 및 접속 기록(IP, 브라우저 정보 등)이 자동으로 수집될 수 있습니다. 광고 개인화를 원하지 않는
          경우 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.
        </p>

        <h3>3. 개인정보의 이용 목적</h3>
        <p>
          수집된 정보는 서비스 운영, 문의 응대, 매일 아침 브리핑 발송, 광고 게재 및 방문자 통계 분석
          목적으로만 이용됩니다.
        </p>

        <h3>4. 개인정보의 제3자 제공 및 처리위탁</h3>
        <p>
          사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않으며, 다음과 같이 서비스 제공에 필요한
          범위 내에서만 개인정보 처리를 위탁합니다: 광고 게재를 위한 카카오 애드핏(쿠키 기반 정보), 이메일
          구독 발송을 위한 Resend(이메일 주소), 텔레그램 구독 발송을 위한 Telegram(채팅 식별값). 위탁받은
          업체는 위탁 목적 범위를 초과하여 개인정보를 이용하지 않습니다.
        </p>

        <h3>5. 개인정보 보유 및 파기</h3>
        <p>
          문의 메일은 문의 처리 목적 달성 후 지체 없이 파기합니다. 브리핑 구독을 위해 수집한 이메일
          주소·텔레그램 채팅 식별값은 구독이 유지되는 동안 보유하며, 이용자가 구독을 해지하면 지체 없이
          파기합니다.
        </p>

        <h3>6. 문의처</h3>
        <p>
          개인정보 관련 문의는 <a href="mailto:honeyhavenlab0@gmail.com">honeyhavenlab0@gmail.com</a>으로
          연락해 주시기 바랍니다.
        </p>
      </article>
    </div>
  )
}
