-- gyeongjejupjup.fyi 도메인 전환 후 subscribe-email 재검증 중 생성된 테스트 구독(미확인 상태) 정리
delete from subscribers where channel = 'email' and status = 'pending';
