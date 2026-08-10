// generate-glossary-term
// 최근 뉴스에 등장하는 경제 용어 중 하나를 골라 Claude(Haiku 4.5)가 쉬운 설명과 예시를 새로 작성한다.
// 이미 등록된 용어는 제외 목록으로 전달해 중복을 피한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'claude-haiku-4-5-20251001'
const CANDIDATE_WINDOW_HOURS = 30
const CANDIDATE_LIMIT = 40

const CATEGORIES = ['markets', 'real_estate', 'industry', 'policy', 'crypto', 'general']

const GLOSSARY_TOOL = {
  name: 'save_glossary_term',
  description: '오늘의 경제 용어를 저장한다.',
  input_schema: {
    type: 'object',
    properties: {
      term: { type: 'string', description: '경제 용어 (짧고 정확한 표준 명칭)' },
      definition: {
        type: 'string',
        description: '경제 지식이 없는 일반 독자도 이해할 수 있는 2~3문장 설명',
      },
      example: {
        type: 'string',
        description: '오늘 뉴스나 일상 사례를 든 1~2문장 예시. 뉴스 원문 문장을 그대로 베끼지 않는다.',
      },
      category: {
        type: 'string',
        enum: CATEGORIES,
        description:
          '용어 분류. markets=증권·금융, real_estate=부동산, industry=산업·기업, policy=정책·거시, crypto=가상자산, general=기타(어느 분류에도 딱 맞지 않는 일반 경제 개념)',
      },
    },
    required: ['term', 'definition', 'example', 'category'],
  },
}

function buildPrompt(
  candidates: { idx: number; source: string; title: string; summary: string }[],
  existingTerms: string[],
) {
  const list = candidates
    .map((c) => `[${c.idx}] (${c.source}) ${c.title}\n요약: ${c.summary || '(요약 없음)'}`)
    .join('\n\n')

  const excluded = existingTerms.length
    ? `이미 등록된 용어(절대 다시 고르지 말 것): ${existingTerms.join(', ')}`
    : '아직 등록된 용어가 없다.'

  return `아래는 최근 ${CANDIDATE_WINDOW_HOURS}시간 동안 수집된 국내 경제뉴스 후보 목록이다.
이 뉴스들에 등장했거나 관련이 깊은 경제 용어 중, 일반 독자가 헷갈리거나 잘 모를 만한 용어를 딱 하나만 골라라.

${excluded}

규칙:
- 이미 등록된 용어와 같거나 사실상 같은 뜻의 용어는 절대 고르지 않는다.
- 설명과 예시는 뉴스 문장을 그대로 베끼지 말고 완전히 새로 작성한 한국어 문장으로 만든다.
- 전문 용어를 쉬운 비유나 일상 사례로 풀어서 설명한다.
- 용어의 성격에 가장 잘 맞는 category를 하나 고른다.
- save_glossary_term 도구를 호출해서 결과를 저장한다.

뉴스 후보 목록:
${list}`
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: existing, error: existingError } = await supabase
    .from('glossary_terms')
    .select('term')

  if (existingError) {
    return new Response(JSON.stringify({ error: existingError.message }), { status: 500 })
  }

  const existingTerms = (existing ?? []).map((t) => t.term)

  const since = new Date(Date.now() - CANDIDATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
  const { data: news, error: newsError } = await supabase
    .from('news')
    .select('source, title, summary, published_at')
    .gte('published_at', since)
    // generate-briefing과 동일한 이유로 연합뉴스는 AI 재구성 소스에서 제외
    .neq('source', '연합뉴스')
    .order('published_at', { ascending: false })
    .limit(CANDIDATE_LIMIT)

  if (newsError) {
    return new Response(JSON.stringify({ error: newsError.message }), { status: 500 })
  }
  if (!news || news.length < 5) {
    return new Response(
      JSON.stringify({ skipped: true, reason: `후보 뉴스가 ${news?.length ?? 0}건뿐이라 용어를 생성하지 않았습니다.` }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const candidates = news.map((n, i) => ({
    idx: i,
    source: n.source,
    title: n.title,
    summary: n.summary ?? '',
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
      max_tokens: 1000,
      tools: [GLOSSARY_TOOL],
      tool_choice: { type: 'tool', name: 'save_glossary_term' },
      messages: [{ role: 'user', content: buildPrompt(candidates, existingTerms) }],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `Claude API ${anthropicRes.status}: ${text}` }), { status: 502 })
  }

  const anthropicJson = await anthropicRes.json()
  const toolUse = (anthropicJson.content ?? []).find((b: { type: string }) => b.type === 'tool_use')

  if (!toolUse) {
    return new Response(JSON.stringify({ error: 'Claude가 save_glossary_term 도구를 호출하지 않았습니다.' }), {
      status: 502,
    })
  }

  const { term, definition, example, category } = toolUse.input
  const safeCategory = CATEGORIES.includes(category) ? category : 'general'

  const { error: upsertError } = await supabase
    .from('glossary_terms')
    .upsert(
      { term, definition, example, model: MODEL, category: safeCategory },
      { onConflict: 'term', ignoreDuplicates: true },
    )

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ term }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
