-- 경제줍줍: community_posts/community_post_comments -> profiles 관계를 PostgREST가 자동 인식하도록 외래키 추가
-- 0021_news_comments_profiles_fk.sql과 동일한 이유: user_id가 auth.users(id)를 참조하는 것만으로는
-- PostgREST 임베드 조인(select('...,profiles(nickname)'))이 관계를 인식하지 못한다.

alter table community_posts
  add constraint community_posts_user_id_profiles_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table community_post_comments
  add constraint community_post_comments_user_id_profiles_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
