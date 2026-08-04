// subscribe-telegram
// 텔레그램 구독을 시작한다. pending 상태의 구독 레코드를 만들고,
// 사용자가 봇을 시작(/start)하면서 이 토큰을 전달할 수 있도록 딥링크를 돌려준다.
// 실제 활성화(chat_id 저장)는 telegram-webhook에서 처리한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const token = crypto.randomUUID()
  const { error } = await supabase
    .from('subscribers')
    .insert({ channel: 'telegram', status: 'pending', token })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const meRes = await fetch(`https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/getMe`)
  const meJson = await meRes.json()
  if (!meRes.ok || !meJson.ok) {
    return new Response(JSON.stringify({ error: '텔레그램 봇 정보를 가져오지 못했습니다.', detail: meJson }), {
      status: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const botUsername = meJson.result.username
  const deepLink = `https://t.me/${botUsername}?start=${token}`

  return new Response(JSON.stringify({ deepLink, botUsername }), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
})
