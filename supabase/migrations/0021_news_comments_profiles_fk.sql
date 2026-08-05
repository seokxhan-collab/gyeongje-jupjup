-- 경제줍줍: news_comments -> profiles 관계를 PostgREST가 자동 인식하도록 외래키 추가
-- news_comments.user_id는 이미 auth.users(id)를 참조하지만, PostgREST의 임베드 조인
-- (select('...,profiles(nickname)'))은 news_comments <-> profiles 사이의 직접적인
-- 외래키가 있어야 관계를 인식한다. profiles.id도 결국 auth.users(id)와 같은 값이므로
-- 이 제약을 추가로 걸어도 항상 만족된다.

alter table news_comments
  add constraint news_comments_user_id_profiles_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
