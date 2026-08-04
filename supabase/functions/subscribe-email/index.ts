// subscribe-email
// 이메일 구독 신청을 pending 상태로 저장하고 Resend로 인증 메일을 보낸다.
// 실제 활성화(active 전환)는 confirm-email-subscription에서 토큰 확인 후 처리한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SITE_URL = 'https://www.gyeongjejupjup.fyi'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const { email } = await req.json().catch(() => ({}))
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: '올바른 이메일 주소를 입력해주세요.' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, status')
    .eq('channel', 'email')
    .eq('destination', email)
    .maybeSingle()

  if (existing?.status === 'active') {
    return new Response(JSON.stringify({ error: '이미 구독 중인 이메일입니다.' }), {
      status: 409,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const token = crypto.randomUUID()

  if (existing) {
    await supabase.from('subscribers').update({ token, status: 'pending' }).eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('subscribers')
      .insert({ channel: 'email', destination: email, status: 'pending', token })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }
  }

  const confirmUrl = `${SITE_URL}/confirm-subscription?token=${token}`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '경제줍줍 <briefing@gyeongjejupjup.fyi>',
      to: email,
      subject: '[경제줍줍] 이메일 구독을 완료해주세요',
      html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
        <h2>경제줍줍</h2>
        <p>아래 버튼을 눌러 이메일 구독을 완료해주세요.</p>
        <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#2f6fed;color:#fff;text-decoration:none;border-radius:6px">구독 완료하기</a></p>
        <p style="color:#888;font-size:12px">본인이 신청하지 않았다면 이 메일을 무시하셔도 됩니다.</p>
      </div>`,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    return new Response(JSON.stringify({ error: '인증 메일 발송에 실패했습니다.', detail }), {
      status: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
})
