-- submit-quiz-score 배포 검증 중 만든 테스트 응시 기록 삭제
delete from quiz_scores where client_id = 'test-client-verify-001';
