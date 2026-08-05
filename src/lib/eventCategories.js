export const EVENT_CATEGORIES = [
  { value: 'central_bank', label: '통화정책' },
  { value: 'employment', label: '고용' },
  { value: 'inflation', label: '물가' },
  { value: 'growth', label: '성장' },
]

export function eventCategoryLabel(value) {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? '기타'
}
