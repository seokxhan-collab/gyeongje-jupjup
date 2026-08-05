-- 경제줍줍: 회원가입/댓글/반응 기능 테스트 중 생성한 테스트 계정 정리
-- auth.users 삭제 시 profiles/news_reactions/news_comments가 on delete cascade로 함께 삭제된다.

delete from auth.users where email = 'testuser01@users.internal';
