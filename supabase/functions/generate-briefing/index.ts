// generate-briefing
// 최근 뉴스 후보 중 중요한 5~10개를 Claude(Haiku 4.5)로 골라 한국어로 재구성 요약한다.
// 원문을 그대로 복사하지 않고, 항목마다 언론사명과 원문 링크를 함께 저장한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'claude-haiku-4-5-20251001'
const CANDIDATE_WINDOW_HOURS = 30
const CANDIDATE_LIMIT = 60

const BRIEFING_TOOL = {
  name: 'save_briefing',
  description: '선정된 경제뉴스 브리핑 항목들을 저장한다.',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        minItems: 5,
        maxItems: 10,
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '재구성한 한국어 헤드라인 (원문 제목 그대로 베끼지 않음)' },
            summary: {
              type: 'string',
              description: '2~3문장으로 재구성한 한국어 요약. 원문 문장을 그대로 복사하지 않는다.',
            },
            source: { type: 'string', description: '후보 목록에 주어진 언론사명 그대로' },
            link: { type: 'string', description: '후보 목록에 주어진 원문 링크 그대로' },
          },
          required: ['title', 'summary', 'source', 'link'],
        },
      },
    },
    required: ['items'],
  },
}

function todayKst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function buildPrompt(candidates: { idx: number; source: string; title: string; summary: string; link: string }[]) {
  const list = candidates
    .map((c) => `[${c.idx}] (${c.source}) ${c.title}\n요약: ${c.summary || '(요약 없음)'}\n링크: ${c.link}`)
    .join('\n\n')

  return `아래는 최근 ${CANDIDATE_WINDOW_HOURS}시간 동안 수집된 국내외 경제뉴스 후보 목록이다.
이 중에서 오늘의 경제 브리핑에 실을 가장 중요한 뉴스 5~10개를 골라라.

규칙:
- 같은 사건을 다루는 중복 기사는 하나만 선택한다.
- 제목과 요약은 원문 문장을 그대로 베끼지 말고, 핵심 내용을 짧게 재구성한 한국어 문장으로 새로 작성한다.
- source와 link는 후보 목록에 주어진 값을 정확히 그대로 사용한다 (변형하거나 새로 만들지 않는다).
- save_briefing 도구를 호출해서 결과를 저장한다.

후보 목록:
${list}`
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const since = new Date(Date.now() - CANDIDATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
  const { data: news, error: newsError } = await supabase
    .from('news')
    .select('source, title, summary, link, published_at')
    .gte('published_at', since)
    // 연합뉴스 RSS는 "AI 학습 및 활용 금지"를 명시하고 있어 AI 재구성 브리핑의 소스 후보에서 제외한다.
    // (일반 뉴스 목록에는 원문 링크만 노출하므로 계속 포함됨)
    .neq('source', '연합뉴스')
    .order('published_at', { ascending: false })
    .limit(CANDIDATE_LIMIT)

  if (newsError) {
    return new Response(JSON.stringify({ error: newsError.message }), { status: 500 })
  }
  if (!news || news.length < 5) {
    return new Response(
      JSON.stringify({ skipped: true, reason: `후보 뉴스가 ${news?.length ?? 0}건뿐이라 브리핑을 생성하지 않았습니다.` }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const candidates = news.map((n, i) => ({
    idx: i,
    source: n.source,
    title: n.title,
    summary: n.summary ?? '',
    link: n.link,
  }))

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      tools: [BRIEFING_TOOL],
      tool_choice: { type: 'tool', name: 'save_briefing' },
      messages: [{ role: 'user', content: buildPrompt(candidates) }],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `Claude API ${anthropicRes.status}: ${text}` }), { status: 502 })
  }

  const anthropicJson = await anthropicRes.json()
  const toolUse = (anthropicJson.content ?? []).find((b: { type: string }) => b.type === 'tool_use')

  if (!toolUse) {
    return new Response(JSON.stringify({ error: 'Claude가 save_briefing 도구를 호출하지 않았습니다.' }), {
      status: 502,
    })
  }

  const items = toolUse.input.items

  // 링크 위조를 방지: 후보 목록에 실제로 존재하는 링크만 허용한다.
  const validLinks = new Set(candidates.map((c) => c.link))
  const safeItems = items.filter((it: { link: string }) => validLinks.has(it.link))

  const briefingDate = todayKst()
  const { error: upsertError } = await supabase
    .from('briefings')
    .upsert(
      { briefing_date: briefingDate, items: safeItems, model: MODEL },
      { onConflict: 'briefing_date' },
    )

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ briefing_date: briefingDate, itemCount: safeItems.length }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
