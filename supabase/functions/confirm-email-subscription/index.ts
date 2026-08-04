// confirm-email-subscription
// 이메일 인증 링크(토큰)를 확인해 pending 구독을 active로 전환한다.

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

  const { token } = await req.json().catch(() => ({}))
  if (typeof token !== 'string' || !token) {
    return new Response(JSON.stringify({ error: '유효하지 않은 링크입니다.' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: pending } = await supabase
    .from('subscribers')
    .select('id')
    .eq('token', token)
    .eq('channel', 'email')
    .eq('status', 'pending')
    .maybeSingle()

  if (!pending) {
    return new Response(JSON.stringify({ error: '이미 사용됐거나 유효하지 않은 링크입니다.' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  await supabase
    .from('subscribers')
    .update({ status: 'active', confirmed_at: new Date().toISOString() })
    .eq('id', pending.id)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
})
