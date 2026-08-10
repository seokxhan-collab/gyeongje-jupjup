import { useDocumentMeta } from '../lib/useDocumentMeta.js'

export default function AboutPage() {
  useDocumentMeta({
    title: '사이트 소개',
    description: '경제줍줍은 국내 경제뉴스를 모아 보여주고, AI가 만드는 경제 브리핑·용어사전을 함께 제공하는 뉴스 큐레이션 서비스입니다.',
  })

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <h2 className="page-title">사이트 소개</h2>
      </div>

      <article className="legal-article">
        <p>
          경제줍줍은 국내 주요 언론사의 경제 뉴스를 한 곳에 모아 보여주는 뉴스 큐레이션 서비스입니다.
          매일경제, 연합뉴스, 이투데이 등 국내 매체의 경제 기사를 수집해 분야별로 정리해 제공합니다.
        </p>

        <h3>자체 제작 콘텐츠</h3>
        <p>
          뉴스 큐레이션 외에도 AI가 그날그날의 주요 경제 뉴스를 참고해 직접 재구성하는{' '}
          <strong>데일리 브리핑</strong>을 매일 아침 제공합니다. 원문을 그대로 옮기지 않고 AI가 새로
          구성한 글이며, 텔레그램·이메일로 구독해 받아볼 수도 있습니다. 뉴스 속 어려운 용어를 매일
          하나씩 풀어 설명하는 <strong>경제 용어사전</strong>도 자체 콘텐츠로 제공합니다. 이와 함께
          FOMC·한국은행 금통위·CPI·고용지표 등 주요 경제 일정을 미리 확인할 수 있는{' '}
          <strong>경제 캘린더</strong>도 제공합니다.
        </p>

        <h3>회원 기능</h3>
        <p>
          회원가입(아이디·닉네임) 후에는 뉴스에 댓글과 좋아요/싫어요 반응을 남기고, 커뮤니티 게시판에
          글을 쓸 수 있습니다. 부적절한 댓글·게시글은 신고를 통해 자동으로 숨김 처리됩니다.
        </p>

        <h3>운영 및 문의</h3>
        <p>
          경제줍줍은 개인이 운영하는 비상업 프로젝트로 시작해 현재는 카카오 애드핏 광고를 통해
          서비스 운영비를 충당하고 있습니다. 서비스 관련 문의나 광고 제휴는{' '}
          <a href="mailto:honeyhavenlab0@gmail.com">honeyhavenlab0@gmail.com</a>으로 연락해 주시기
          바랍니다.
        </p>

        <p className="page-disclaimer">
          사이트가 제공하는 데일리 브리핑·용어사전은 AI가 재구성한 콘텐츠이며, 투자 판단의
          참고용으로만 활용하시기 바랍니다. 원문 기사에 대한 저작권은 각 언론사에 있습니다.
        </p>
      </article>
    </div>
  )
}
