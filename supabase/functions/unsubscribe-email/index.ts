// unsubscribe-email
// 브리핑 이메일 하단의 구독 해지 링크(GET, ?token=)를 받아 즉시 처리하고 결과 HTML을 보여준다.
// 이메일 클라이언트에서 클릭하는 링크라 Supabase JWT를 보낼 수 없으므로
// --no-verify-jwt로 배포해야 한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

function page(message: string) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>경제줍줍 구독 해지</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#1a1a1a;padding:0 20px}</style>
</head><body><h2>경제줍줍</h2><p>${message}</p></body></html>`
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(page('유효하지 않은 링크입니다.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: sub } = await supabase
    .from('subscribers')
    .select('id')
    .eq('token', token)
    .eq('channel', 'email')
    .eq('status', 'active')
    .maybeSingle()

  if (!sub) {
    return new Response(page('이미 해지됐거나 유효하지 않은 링크입니다.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  await supabase.from('subscribers').update({ status: 'unsubscribed' }).eq('id', sub.id)

  return new Response(page('구독이 해지됐습니다. 그동안 읽어주셔서 감사합니다.'), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
})
