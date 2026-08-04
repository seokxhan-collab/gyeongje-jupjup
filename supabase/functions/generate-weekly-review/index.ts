// generate-weekly-review
// 지난 7일치 데일리 브리핑(briefings.items — 이미 AI가 원문을 재구성한 요약)을 재료로
// Claude(Haiku 4.5)가 한 주를 되짚는 칼럼형 주간 시황 총평을 새로 작성한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'claude-haiku-4-5-20251001'
const LOOKBACK_DAYS = 7

const WEEKLY_REVIEW_TOOL = {
  name: 'save_weekly_review',
  description: '주간 시황 총평 칼럼을 저장한다.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '칼럼 제목 (한 줄, 그 주를 압축하는 헤드라인)' },
      paragraphs: {
        type: 'array',
        minItems: 3,
        maxItems: 6,
        items: { type: 'string' },
        description: '3~6개 문단으로 구성된 칼럼 본문. 각 문단은 3~5문장 정도의 자체 서술.',
      },
    },
    required: ['title', 'paragraphs'],
  },
}

function todayKst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function buildPrompt(days: { briefing_date: string; items: { title: string; summary: string; source: string }[] }[]) {
  const list = days
    .map(
      (d) =>
        `## ${d.briefing_date}\n` +
        d.items.map((it) => `- (${it.source}) ${it.title}: ${it.summary}`).join('\n'),
    )
    .join('\n\n')

  return `아래는 지난 ${LOOKBACK_DAYS}일간의 데일리 경제 브리핑 기록이다 (이미 AI가 한 번 재구성한 요약이며, 원문 뉴스가 아니다).
이 기록을 재료 삼아, 이번 주 경제 흐름을 되짚는 칼럼형 "주간 시황 총평"을 새로 작성하라.

규칙:
- 개별 브리핑 문장을 그대로 옮기지 말고, 한 주 전체를 관통하는 흐름/맥락 중심으로 새로 서술한다.
- 특정 날짜의 나열이 아니라, 주제별(예: 금리·환율, 국내 증시, 부동산, 산업 이슈 등)로 묶어 분석하듯 쓴다.
- 문단마다 근거가 되는 사건을 자연스럽게 녹여서 설명하되, 과도한 숫자 나열은 피한다.
- 투자 조언이 아닌 사실 기반 정리/해설 톤을 유지한다.
- save_weekly_review 도구를 호출해서 결과를 저장한다.

지난 ${LOOKBACK_DAYS}일 브리핑 기록:
${list}`
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const sinceDate = since.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

  const { data: briefings, error: briefingsError } = await supabase
    .from('briefings')
    .select('briefing_date, items')
    .gte('briefing_date', sinceDate)
    .order('briefing_date', { ascending: true })

  if (briefingsError) {
    return new Response(JSON.stringify({ error: briefingsError.message }), { status: 500 })
  }
  if (!briefings || briefings.length < 2) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: `지난 ${LOOKBACK_DAYS}일치 브리핑이 ${briefings?.length ?? 0}건뿐이라 주간 총평을 생성하지 않았습니다.`,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      tools: [WEEKLY_REVIEW_TOOL],
      tool_choice: { type: 'tool', name: 'save_weekly_review' },
      messages: [{ role: 'user', content: buildPrompt(briefings) }],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `Claude API ${anthropicRes.status}: ${text}` }), { status: 502 })
  }

  const anthropicJson = await anthropicRes.json()
  const toolUse = (anthropicJson.content ?? []).find((b: { type: string }) => b.type === 'tool_use')

  if (!toolUse) {
    return new Response(JSON.stringify({ error: 'Claude가 save_weekly_review 도구를 호출하지 않았습니다.' }), {
      status: 502,
    })
  }

  const { title, paragraphs } = toolUse.input

  const weekStart = todayKst()
  const { error: upsertError } = await supabase
    .from('weekly_reviews')
    .upsert(
      { week_start: weekStart, title, paragraphs, model: MODEL },
      { onConflict: 'week_start' },
    )

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ week_start: weekStart, paragraphCount: paragraphs.length }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
