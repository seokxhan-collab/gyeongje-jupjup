// setup-telegram-webhook
// 텔레그램 봇의 webhook을 telegram-webhook 함수 URL로 등록/갱신하는 1회성 관리용 함수.
// TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET 값을 호출자에게 노출하지 않고 서버 안에서만 사용한다.

Deno.serve(async () => {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
  const secret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')!
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/telegram-webhook`

  const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ['message', 'my_chat_member'],
    }),
  })
  const json = await res.json()

  return new Response(JSON.stringify(json, null, 2), {
    status: res.ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json' },
  })
})
