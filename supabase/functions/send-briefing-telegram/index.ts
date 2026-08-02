// send-briefing-telegram
// 그날의 데일리 브리핑을 텔레그램 메시지로 전송한다.
// generate-briefing이 끝난 직후(오전 7시 5분)에 실행되도록 크론에 등록한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

function todayKst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function formatMessage(briefingDate: string, items: { title: string; summary: string; source: string; link: string }[]) {
  const lines = items.map(
    (item, i) => `${i + 1}. ${item.title}\n${item.summary}\n(${item.source}) ${item.link}`,
  )
  return `📌 오늘의 경제 브리핑 (${briefingDate})\n\n${lines.join('\n\n')}`
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const today = todayKst()
  const { data: briefing, error } = await supabase
    .from('briefings')
    .select('briefing_date, items')
    .eq('briefing_date', today)
    .maybeSingle()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  if (!briefing) {
    return new Response(
      JSON.stringify({ skipped: true, reason: `${today}자 브리핑이 아직 없습니다.` }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const text = formatMessage(briefing.briefing_date, briefing.items ?? [])

  const telegramRes = await fetch(
    `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: Deno.env.get('TELEGRAM_CHAT_ID'),
        text,
        disable_web_page_preview: true,
      }),
    },
  )

  const telegramJson = await telegramRes.json()
  if (!telegramRes.ok || !telegramJson.ok) {
    return new Response(JSON.stringify({ error: 'Telegram API 실패', detail: telegramJson }), {
      status: 502,
    })
  }

  return new Response(JSON.stringify({ sent: true, briefing_date: briefing.briefing_date }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
