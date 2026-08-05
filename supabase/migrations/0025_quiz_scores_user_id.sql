-- 경제줍줍: 로그인 계정과 퀴즈 기록 연결
-- quiz_scores는 로그인 시스템(0018_profiles) 이전부터 client_id(브라우저 익명 기기 식별값)만으로
-- 운영되어 왔다. 그 결과 /mypage "내 활동"의 퀴즈 기록이 계정이 아니라 기기 기준으로 조회되어,
-- 다른 브라우저/기기에서 같은 계정으로 로그인해도 퀴즈 기록이 보이지 않는 문제가 있었다.
-- user_id를 추가해 로그인 상태로 응시한 경우 계정과 연결한다.
-- 기존 데이터는 계정과의 연결고리가 남아있지 않아 소급 backfill은 하지 않는다
-- (이 마이그레이션 배포 이후 로그인 상태로 응시한 기록부터 계정에 연결됨).
-- client_id는 순위표(quiz_scores unique 제약, 비로그인 응시)를 위해 계속 사용하므로 그대로 둔다.

alter table quiz_scores
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists quiz_scores_user_id_idx on quiz_scores (user_id);
