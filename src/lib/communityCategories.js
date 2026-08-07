export const COMMUNITY_CATEGORIES = [
  { value: 'free', label: '자유' },
  { value: 'question', label: '질문' },
  { value: 'info', label: '정보공유' },
]

export function communityCategoryLabel(value) {
  return COMMUNITY_CATEGORIES.find((c) => c.value === value)?.label ?? '자유'
}
