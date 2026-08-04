// submit-quiz-score
// 클라이언트가 고른 답안(선택지 인덱스 배열)을 받아 서버에서 채점한다.
// 점수 자체는 절대 클라이언트로부터 신뢰하지 않는다 — quizzes.questions의 correct_index와 직접 대조한다.
// (quiz_date, client_id)에 unique 제약이 있어 하루 1회만 기록되며, 이미 응시했다면 기존 기록을 그대로 반환한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MAX_NICKNAME_LENGTH = 20

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  let body: { quiz_date?: string; client_id?: string; nickname?: string; answers?: number[] }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: '잘못된 요청 본문입니다.' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const { quiz_date, client_id, answers } = body
  const nickname = (body.nickname ?? '').trim().slice(0, MAX_NICKNAME_LENGTH) || null

  if (!quiz_date || !client_id || !Array.isArray(answers)) {
    return new Response(JSON.stringify({ error: 'quiz_date, client_id, answers가 모두 필요합니다.' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('questions')
    .eq('quiz_date', quiz_date)
    .maybeSingle()

  if (quizError) {
    return new Response(JSON.stringify({ error: quizError.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }
  if (!quiz) {
    return new Response(JSON.stringify({ error: '해당 날짜의 퀴즈를 찾을 수 없습니다.' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const questions = quiz.questions as { correct_index: number }[]
  const total = questions.length

  if (answers.length !== total) {
    return new Response(JSON.stringify({ error: `답안 개수가 문항 수(${total})와 일치하지 않습니다.` }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const score = questions.reduce((acc, q, i) => (answers[i] === q.correct_index ? acc + 1 : acc), 0)

  const { error: insertError } = await supabase
    .from('quiz_scores')
    .insert({ quiz_date, client_id, nickname, score, total })

  let alreadyPlayed = false
  let finalScore = score

  if (insertError) {
    // 23505 = unique_violation: 오늘 이미 응시함. 기존 기록을 그대로 사용한다(재도전으로 점수 갱신 방지).
    if (insertError.code === '23505') {
      alreadyPlayed = true
      const { data: existing, error: fetchError } = await supabase
        .from('quiz_scores')
        .select('score, total')
        .eq('quiz_date', quiz_date)
        .eq('client_id', client_id)
        .maybeSingle()

      if (fetchError || !existing) {
        return new Response(JSON.stringify({ error: fetchError?.message ?? '기존 기록을 찾을 수 없습니다.' }), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        })
      }
      finalScore = existing.score
    } else {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }
  }

  const { count: higherCount, error: rankError } = await supabase
    .from('quiz_scores')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_date', quiz_date)
    .gt('score', finalScore)

  const { count: participantCount } = await supabase
    .from('quiz_scores')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_date', quiz_date)

  if (rankError) {
    return new Response(JSON.stringify({ error: rankError.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      score: finalScore,
      total,
      rank: (higherCount ?? 0) + 1,
      participantCount: participantCount ?? 0,
      alreadyPlayed,
    }),
    { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
  )
})
