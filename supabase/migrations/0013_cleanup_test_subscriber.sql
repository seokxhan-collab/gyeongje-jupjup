-- telegram-webhook 검증 중 만든 가짜 chat_id(999999999) 테스트 구독자 삭제
delete from subscribers where destination = '999999999';
