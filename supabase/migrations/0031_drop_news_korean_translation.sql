-- 경제줍줍: 해외 기사 한국어 번역 기능 롤백
-- 해외 소스(CNBC/WSJ/FT) 수집을 중단하면서(API 비용 부담) title_ko/summary_ko 번역 기능도
-- 함께 제거한다. 0030에서 추가했던 컬럼과 인덱스를 되돌린다.

drop index if exists news_untranslated_idx;

alter table news
  drop column if exists title_ko,
  drop column if exists summary_ko;
