-- 브라우저 UI 검증 중 만들어졌지만 실제로 활성화(텔레그램 /start)되지 않은 pending 구독 정리
delete from subscribers where status = 'pending';
