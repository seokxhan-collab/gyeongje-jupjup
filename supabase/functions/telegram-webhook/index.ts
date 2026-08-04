// telegram-webhook
// 텔레그램이 봇으로 들어온 업데이트(메시지 등)를 보내주는 웹훅 수신처.
// /start <token> → subscribe-telegram이 발급한 토큰을 chat_id와 연결해 구독을 활성화한다.
// /stop → 구독 해지. 봇 차단(kicked) 시에도 자동으로 구독을 해지한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

Deno.serve(async (req) => {
  // Telegram이 보낸 요청이 맞는지 secret token으로 검증한다.
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== Deno.env.get('TELEGRAM_WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const update = await req.json()

  // 봇을 차단/추방하면 더 이상 보내지 않도록 자동 해지한다.
  const memberUpdate = update.my_chat_member
  if (memberUpdate && ['kicked', 'left'].includes(memberUpdate.new_chat_member?.status)) {
    await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('channel', 'telegram')
      .eq('destination', String(memberUpdate.chat.id))
      .eq('status', 'active')
    return new Response('ok')
  }

  const message = update.message
  const chatId = message?.chat?.id
  const text: string | undefined = message?.text

  if (!chatId || !text) {
    return new Response('ok')
  }

  if (text.startsWith('/start')) {
    const token = text.split(' ')[1]?.trim()
    if (!token) {
      await sendMessage(chatId, '경제줍줍 사이트의 "텔레그램으로 받기" 버튼을 통해 시작해주세요.')
      return new Response('ok')
    }

    const { data: pending } = await supabase
      .from('subscribers')
      .select('id')
      .eq('token', token)
      .eq('channel', 'telegram')
      .eq('status', 'pending')
      .maybeSingle()

    if (!pending) {
      await sendMessage(chatId, '유효하지 않거나 이미 사용된 링크입니다. 사이트에서 다시 시도해주세요.')
      return new Response('ok')
    }

    await supabase
      .from('subscribers')
      .update({ destination: String(chatId), status: 'active', confirmed_at: new Date().toISOString() })
      .eq('id', pending.id)

    await sendMessage(chatId, '✅ 구독이 완료됐습니다! 매일 아침 경제줍줍의 오늘의 브리핑을 여기로 보내드릴게요.\n구독을 그만 받고 싶으면 언제든 /stop 을 입력해주세요.')
    return new Response('ok')
  }

  if (text.startsWith('/stop')) {
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('channel', 'telegram')
      .eq('destination', String(chatId))
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      await supabase.from('subscribers').update({ status: 'unsubscribed' }).eq('id', existing.id)
      await sendMessage(chatId, '구독이 해지됐습니다. 다시 받고 싶으시면 사이트에서 언제든 재구독하실 수 있어요.')
    } else {
      await sendMessage(chatId, '현재 활성화된 구독이 없습니다.')
    }
    return new Response('ok')
  }

  return new Response('ok')
})
