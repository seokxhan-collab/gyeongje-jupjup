-- 경제줍줍: 퀴즈/주간시황/용어사전 자동 생성 중단
-- 해당 기능(및 대응 Edge Function)을 삭제하면서 관련 크론도 해제한다 (API 비용 절감).
-- 기존 데이터(quizzes, quiz_scores, weekly_reviews, glossary_terms 등)는 보존한다 —
-- 기능을 나중에 다시 켤 때 그대로 이어서 쓸 수 있도록.

select cron.unschedule('generate-quiz-daily');
select cron.unschedule('generate-weekly-review-monday');
select cron.unschedule('generate-glossary-term-daily');
