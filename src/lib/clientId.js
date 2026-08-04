const CLIENT_ID_KEY = 'econ-news-client-id'
const NICKNAME_KEY = 'econ-news-nickname'

export function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, id)
  }
  return id
}

export function getSavedNickname() {
  return localStorage.getItem(NICKNAME_KEY) ?? ''
}

export function saveNickname(nickname) {
  if (nickname) localStorage.setItem(NICKNAME_KEY, nickname)
}
