// generate-quiz
// 최근 뉴스 후보를 바탕으로 Claude(Haiku 4.5)가 오늘의 경제 퀴즈 4~5문항을 생성한다.
// 문항/보기/해설은 전부 새로 작성한 자체 콘텐츠이며, 뉴스 원문을 그대로 옮기지 않는다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'claude-haiku-4-5-20251001'
const CANDIDATE_WINDOW_HOURS = 30
const CANDIDATE_LIMIT = 60

const QUIZ_TOOL = {
  name: 'save_quiz',
  description: '오늘의 경제 퀴즈 문항들을 저장한다.',
  input_schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        minItems: 4,
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: '한국어 퀴즈 질문. 뉴스 원문 문장을 그대로 베끼지 않는다.' },
            choices: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              items: { type: 'string' },
              description: '보기 4개',
            },
            correct_index: { type: 'integer', minimum: 0, maximum: 3, description: '정답 보기의 인덱스(0~3)' },
            explanation: { type: 'string', description: '정답 해설 1~2문장' },
          },
          required: ['question', 'choices', 'correct_index', 'explanation'],
        },
      },
    },
    required: ['questions'],
  },
}

function todayKst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

// Claude가 생성하는 문항은 정답이 특정 번호(주로 2번)에 몰리는 경향이 있어,
// 문항마다 보기 순서를 무작위로 섞고 correct_index를 그에 맞게 다시 계산한다.
function shuffleChoices(
  questions: { question: string; choices: string[]; correct_index: number; explanation: string }[],
) {
  return questions.map((q) => {
    const order = q.choices.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    const choices = order.map((i) => q.choices[i])
    const correct_index = order.indexOf(q.correct_index)
    return { ...q, choices, correct_index }
  })
}

function buildPrompt(candidates: { idx: number; source: string; title: string; summary: string }[]) {
  const list = candidates
    .map((c) => `[${c.idx}] (${c.source}) ${c.title}\n요약: ${c.summary || '(요약 없음)'}`)
    .join('\n\n')

  return `아래는 최근 ${CANDIDATE_WINDOW_HOURS}시간 동안 수집된 국내외 경제뉴스 후보 목록이다.
이 뉴스들을 참고해서 일반 독자가 풀 만한 오늘의 경제 상식 퀴즈 4~5문항을 새로 만들어라.

규칙:
- 문항, 보기, 해설은 뉴스 문장을 그대로 베끼지 말고 완전히 새로 작성한 한국어 문장으로 만든다.
- 단순 사실 확인(예/아니오)보다는 "다음 중 옳은 것은?" 형태의 객관식 4지선다로 만든다.
- 너무 지엽적인 숫자 암기보다는 핵심 개념/맥락을 이해했는지 확인하는 문제가 좋다.
- save_quiz 도구를 호출해서 결과를 저장한다.

뉴스 후보 목록:
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
      JSON.stringify({ skipped: true, reason: `후보 뉴스가 ${news?.length ?? 0}건뿐이라 퀴즈를 생성하지 않았습니다.` }),
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
      max_tokens: 2000,
      tools: [QUIZ_TOOL],
      tool_choice: { type: 'tool', name: 'save_quiz' },
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
    return new Response(JSON.stringify({ error: 'Claude가 save_quiz 도구를 호출하지 않았습니다.' }), {
      status: 502,
    })
  }

  const questions = shuffleChoices(toolUse.input.questions)

  const quizDate = todayKst()
  const { error: upsertError } = await supabase
    .from('quizzes')
    .upsert(
      { quiz_date: quizDate, questions, model: MODEL },
      { onConflict: 'quiz_date' },
    )

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ quiz_date: quizDate, questionCount: questions.length }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
