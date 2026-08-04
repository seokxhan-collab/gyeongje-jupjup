-- subscribe-email 함수 검증 중 생성된 pending 테스트 구독(도메인 미인증으로 발송 실패한 상태) 정리
delete from subscribers where channel = 'email' and status = 'pending';
