// collect-news
// 등록된 RSS 피드를 주기적으로 읽어 news 테이블에 저장한다.
// 원문 전체는 절대 가져오지 않는다: title, RSS가 제공하는 짧은 description, link만 저장한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.5.0'

// 한국경제(hankyung.com)는 자동화된 반복 요청 시 Cloudflare 봇 차단(403)에 걸리는 것을
// 실제 테스트로 확인해 제외했다 (2026-08-02). 이투데이로 대체.
// 해외 소스(CNBC/WSJ/FT)는 API 비용이 드는 한국어 번역이 필수적이라 2026-08-10 제외했다.
const SOURCES = [
  { source: '매일경제', country: 'domestic', url: 'https://www.mk.co.kr/rss/30100041/' },
  { source: '연합뉴스', country: 'domestic', url: 'https://www.yna.co.kr/rss/economy.xml' },
  { source: '이투데이', country: 'domestic', url: 'https://rss.etoday.co.kr/eto/economy_news.xml' },
] as const

const MAX_SUMMARY_LENGTH = 280
const RETENTION_DAYS = 7
const FETCH_TIMEOUT_MS = 10000

// AI 호출 없이 키워드 매칭으로만 분류한다 (비용 없음). 우선순위 순서대로 첫 매치를 사용.
// src/lib/categories.js의 CATEGORIES 목록과 값이 반드시 일치해야 한다.
const CATEGORY_RULES: { category: string; pattern: RegExp }[] = [
  {
    category: 'crypto',
    pattern: /비트코인|암호화폐|가상자산|이더리움|bitcoin|crypto|ethereum|blockchain/i,
  },
  {
    category: 'real_estate',
    pattern: /부동산|아파트|전세|월세|청약|집값|분양|주택|재건축|재개발|housing|real estate|mortgage/i,
  },
  {
    category: 'markets',
    pattern:
      /증시|코스피|코스닥|주가|주식|환율|금리|달러|엔화|원화|채권|한국은행|연준|신용등급|증권|나스닥|다우|stock|market|bond|currency|dollar|yen|federal reserve|wall street/i,
  },
  {
    category: 'industry',
    pattern: /반도체|수출|수입|무역|실적|기업|산업|제조|자동차|조선|배터리|공장|semiconductor|export|earnings|manufacturing|corporate/i,
  },
  {
    category: 'policy',
    pattern: /정부|국회|세금|예산|물가|인플레이션|총리|대통령|정책|규제|관세|기획재정부|고용|실업률|gdp|inflation|tariff|policy|budget|government/i,
  },
]

function classify(title: string, summary: string): string {
  const text = `${title} ${summary}`
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.category
  }
  return 'general'
}

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === 'item',
})

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input
  return input.slice(0, max).trim() + '…'
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timeout)
  }
}

// WSJ RSS는 같은 기사라도 폴링 시점마다 ?mod= 추적 파라미터 값이 달라질 때가 있어
// (예: rss_marketsmain ↔ rss_markets_main) link 완전일치 dedup을 우회해 같은 기사가
// 중복 저장되는 문제가 있었다. mod는 순수 추적용 파라미터라 제거해도 기사 접근에는
// 영향이 없다.
function normalizeLink(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.delete('mod')
    return u.toString()
  } catch {
    return url
  }
}

function parseFeed(xml: string) {
  const doc = parser.parse(xml)
  const channel = doc?.rss?.channel ?? doc?.feed
  const items = channel?.item ?? []
  return items.map((item: Record<string, unknown>) => {
    const rawTitle = typeof item.title === 'string' ? item.title : String(item.title ?? '')
    const rawLink = typeof item.link === 'string' ? item.link : String(item.link ?? '')
    const rawDescription =
      typeof item.description === 'string' ? item.description : String(item.description ?? '')
    const pubDateRaw = (item.pubDate ?? item.published ?? item.updated) as string | undefined

    const publishedAt = pubDateRaw ? new Date(pubDateRaw) : null

    return {
      title: stripHtml(rawTitle),
      link: normalizeLink(rawLink.trim()),
      summary: truncate(stripHtml(rawDescription), MAX_SUMMARY_LENGTH),
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt.toISOString() : null,
    }
  })
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const results: Record<string, { fetched: number; upserted: number; error?: string }> = {}

  for (const src of SOURCES) {
    try {
      const xml = await fetchText(src.url)
      const items = parseFeed(xml).filter((it) => it.title && it.link && it.publishedAt)

      // 같은 배치 안에 동일한 link가 중복되면 upsert(onConflict: 'link')가
      // "ON CONFLICT DO UPDATE command cannot affect row a second time" 에러를 낸다.
      const dedupedByLink = new Map(items.map((it) => [it.link, it]))

      const rows = Array.from(dedupedByLink.values()).map((it) => ({
        source: src.source,
        source_country: src.country,
        category: classify(it.title, it.summary),
        title: it.title,
        summary: it.summary,
        link: it.link,
        published_at: it.publishedAt,
        fetched_at: new Date().toISOString(),
      }))

      results[src.source] = { fetched: items.length, upserted: 0 }

      if (rows.length > 0) {
        const { error, count } = await supabase
          .from('news')
          .upsert(rows, { onConflict: 'link', count: 'exact' })
        if (error) throw error
        results[src.source].upserted = count ?? rows.length
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : String(err)
      results[src.source] = { ...(results[src.source] ?? { fetched: 0, upserted: 0 }), error: message }
    }
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { error: cleanupError } = await supabase.from('news').delete().lt('published_at', cutoff)

  return new Response(
    JSON.stringify({ results, cleanupError: cleanupError?.message ?? null }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
