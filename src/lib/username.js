const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const INTERNAL_EMAIL_DOMAIN = 'users.internal'

export function isValidUsername(username) {
  return USERNAME_REGEX.test(username)
}

// Supabase Auth는 이메일 기반이라, "아이디"만 입력받는 UX를 위해
// 내부적으로만 쓰이는 가짜 이메일로 변환해 signUp/signInWithPassword에 넘긴다.
export function usernameToInternalEmail(username) {
  return `${username}@${INTERNAL_EMAIL_DOMAIN}`
}
