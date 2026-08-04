// send-daily-briefing-subscribers
// 그날의 데일리 브리핑을 활성 구독자 전원(텔레그램/이메일)에게 전송한다.
// generate-briefing(07:00 KST) 직후에 실행되도록 크론에 등록한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

type BriefingItem = { title: string; summary: string; source: string; link: string }

function todayKst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function formatTelegramMessage(briefingDate: string, items: BriefingItem[]) {
  const lines = items.map(
    (item, i) => `${i + 1}. ${item.title}\n${item.summary}\n(${item.source}) ${item.link}`,
  )
  return `📌 오늘의 경제 브리핑 (${briefingDate})\n\n${lines.join('\n\n')}\n\n구독을 그만 받고 싶으면 /stop 을 입력해주세요.`
}

function formatEmailHtml(briefingDate: string, items: BriefingItem[], unsubscribeUrl: string) {
  const rows = items
    .map(
      (item, i) =>
        `<li style="margin-bottom:16px"><strong>${i + 1}. ${item.title}</strong><br/>${item.summary}<br/><a href="${item.link}">(${item.source}) 기사 보기</a></li>`,
    )
    .join('')
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
    <h2>📌 오늘의 경제 브리핑 (${briefingDate})</h2>
    <ol style="padding-left:20px">${rows}</ol>
    <p style="color:#888;font-size:12px">그만 받고 싶으시면 <a href="${unsubscribeUrl}">구독 해지</a>를 눌러주세요.</p>
  </div>`
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const today = todayKst()
  const { data: briefing, error: briefingError } = await supabase
    .from('briefings')
    .select('briefing_date, items')
    .eq('briefing_date', today)
    .maybeSingle()

  if (briefingError) {
    return new Response(JSON.stringify({ error: briefingError.message }), { status: 500 })
  }
  if (!briefing) {
    return new Response(
      JSON.stringify({ skipped: true, reason: `${today}자 브리핑이 아직 없습니다.` }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('id, channel, destination, token')
    .in('channel', ['telegram', 'email'])
    .eq('status', 'active')

  if (subError) {
    return new Response(JSON.stringify({ error: subError.message }), { status: 500 })
  }
  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: '활성 구독자가 없습니다.' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const items: BriefingItem[] = briefing.items ?? []
  const telegramSubs = subscribers.filter((s) => s.channel === 'telegram')
  const emailSubs = subscribers.filter((s) => s.channel === 'email')

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const text = formatTelegramMessage(briefing.briefing_date, items)

  const telegramResults = await Promise.allSettled(
    telegramSubs.map(async (sub) => {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: sub.destination, text, disable_web_page_preview: true }),
      })
      const json = await res.json()
      // 403: 사용자가 봇을 차단함 -> 더 이상 보내지 않도록 구독 해지 처리
      if (!res.ok && res.status === 403) {
        await supabase.from('subscribers').update({ status: 'unsubscribed' }).eq('id', sub.id)
      }
      if (!res.ok || !json.ok) throw new Error(json.description ?? 'telegram send failed')
      return sub.id
    }),
  )

  let emailResults: PromiseSettledResult<string>[] = []
  if (resendKey && emailSubs.length > 0) {
    emailResults = await Promise.allSettled(
      emailSubs.map(async (sub) => {
        const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-email?token=${sub.token}`
        const html = formatEmailHtml(briefing.briefing_date, items, unsubscribeUrl)
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: '경제줍줍 <briefing@gyeongjejupjup.kro.kr>',
            to: sub.destination,
            subject: `[경제줍줍] 오늘의 경제 브리핑 (${briefing.briefing_date})`,
            html,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        return sub.id
      }),
    )
  }

  const sentTelegram = telegramResults.filter((r) => r.status === 'fulfilled').length
  const sentEmail = emailResults.filter((r) => r.status === 'fulfilled').length
  const sent = sentTelegram + sentEmail
  const failed = telegramResults.length - sentTelegram + (emailResults.length - sentEmail)

  return new Response(
    JSON.stringify({ briefing_date: briefing.briefing_date, sent, failed, total: subscribers.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
