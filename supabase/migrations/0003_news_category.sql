-- 경제줍줍: 뉴스 카테고리 분류 추가
-- AI 호출 없이 제목/요약 키워드 매칭으로 분류한다 (collect-news에서 계산해서 저장).

alter table news
  add column if not exists category text not null default 'general'
    check (category in ('markets', 'real_estate', 'industry', 'policy', 'crypto', 'general'));

create index if not exists news_category_idx on news (category);

-- 기존 행 소급 분류 (키워드 매칭, collect-news의 classify()와 동일한 우선순위)
update news set category = 'crypto'
where category = 'general'
  and (title || ' ' || coalesce(summary, '')) ~* '비트코인|암호화폐|가상자산|이더리움|bitcoin|crypto|ethereum|blockchain';

update news set category = 'real_estate'
where category = 'general'
  and (title || ' ' || coalesce(summary, '')) ~* '부동산|아파트|전세|월세|청약|집값|분양|주택|재건축|재개발|housing|real estate|mortgage';

update news set category = 'markets'
where category = 'general'
  and (title || ' ' || coalesce(summary, '')) ~* '증시|코스피|코스닥|주가|주식|환율|금리|달러|엔화|원화|채권|한국은행|연준|신용등급|증권|나스닥|다우|stock|market|bond|currency|dollar|yen|federal reserve|wall street';

update news set category = 'industry'
where category = 'general'
  and (title || ' ' || coalesce(summary, '')) ~* '반도체|수출|수입|무역|실적|기업|산업|제조|자동차|조선|배터리|공장|semiconductor|export|earnings|manufacturing|corporate';

update news set category = 'policy'
where category = 'general'
  and (title || ' ' || coalesce(summary, '')) ~* '정부|국회|세금|예산|물가|인플레이션|총리|대통령|정책|규제|관세|기획재정부|고용|실업률|gdp|inflation|tariff|policy|budget|government';
