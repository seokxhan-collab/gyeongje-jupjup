// 프론트엔드 필터 UI와 collect-news Edge Function이 공유하는 언론사 메타데이터.
// source 값은 news 테이블의 source 컬럼과 반드시 일치해야 한다.
export const SOURCES = [
  { source: '매일경제', country: 'domestic' },
  { source: '연합뉴스', country: 'domestic' },
  { source: '이투데이', country: 'domestic' },
  { source: 'CNBC', country: 'international' },
  { source: 'WSJ', country: 'international' },
  { source: 'Financial Times', country: 'international' },
]
