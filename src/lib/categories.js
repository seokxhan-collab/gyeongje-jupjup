// collect-news Edge Function의 CATEGORY_RULES가 계산한 값과 반드시 일치해야 한다.
export const CATEGORIES = [
  { value: 'markets', label: '증권·금융' },
  { value: 'real_estate', label: '부동산' },
  { value: 'industry', label: '산업·기업' },
  { value: 'policy', label: '정책·거시' },
  { value: 'crypto', label: '가상자산' },
  { value: 'general', label: '기타' },
]

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? '기타'
}
