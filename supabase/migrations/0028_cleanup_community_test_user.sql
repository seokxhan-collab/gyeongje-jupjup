-- 경제줍줍: 커뮤니티 게시판 기능 테스트 중 생성한 테스트 계정 정리
-- auth.users 삭제 시 profiles/community_posts/community_post_comments가 on delete cascade로 함께 삭제된다.

delete from auth.users where email = 'claudetest0808@users.internal';
