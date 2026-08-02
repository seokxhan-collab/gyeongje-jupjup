# 경제줍줍

국내외 경제뉴스를 RSS로 모아 보여주는 뉴스 모음 사이트. 기사 본문은 저장하지 않고 제목 + RSS 공식 요약 + 원문 링크만 사용한다. 하루 한 번 AI(Claude Haiku 4.5)가 그날의 주요 뉴스 5~10개를 재구성해 요약하는 데일리 브리핑을 자동 생성한다.

## 구조

- `src/` — Vite + React 프론트엔드 (뉴스 모음 화면, 필터, 데일리 브리핑)
- `supabase/schema.sql` — `news`, `briefings` 테이블 + RLS 정책
- `supabase/functions/collect-news` — RSS 수집 Edge Function
- `supabase/functions/generate-briefing` — Claude API로 데일리 브리핑 생성하는 Edge Function
- `supabase/cron.sql` — 위 두 함수를 주기적으로 호출하는 pg_cron 설정

## 최초 설정 (한 번만)

### 1. Supabase 프로젝트 생성

[supabase.com](https://supabase.com/dashboard)에서 새 프로젝트를 만든다 (무료 티어로 충분).

### 2. CLI 로그인 & 프로젝트 연결

```
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

`<PROJECT_REF>`는 Supabase 대시보드 프로젝트 URL의 서브도메인 부분(`https://<PROJECT_REF>.supabase.co`)이다.

### 3. 스키마 적용

Supabase 대시보드 > SQL Editor에서 `supabase/schema.sql` 내용을 실행한다.

### 4. Claude API 키 등록

[Anthropic Console](https://console.anthropic.com)에서 API 키를 발급받는다 (Claude Pro 구독과는 별개 — 사용량만큼 과금).

```
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 5. Edge Functions 배포

```
npx supabase functions deploy collect-news
npx supabase functions deploy generate-briefing
```

### 6. 크론 등록

`supabase/cron.sql`을 열어 `<PROJECT_REF>`와 `<ANON_KEY>`(대시보드 Settings > API에서 확인)를 실제 값으로 바꾼 뒤, SQL Editor에서 실행한다. 이후 `collect-news`는 30분마다, `generate-briefing`은 매일 KST 오전 7시경 자동 실행된다.

### 7. 프론트엔드 환경변수

`.env.example`을 `.env`로 복사하고 Supabase 대시보드 Settings > API 값으로 채운다.

```
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY>
```

## 로컬 개발

```
npm install
npm run dev
```

수집 함수를 배포 없이 로컬에서 테스트하려면:

```
npx supabase functions serve collect-news --env-file supabase/.env.local
```

(`supabase/.env.local`에 `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 넣어야 한다. 이 파일은 절대 커밋하지 않는다.)

## 배포 (Vercel)

Vercel에 이 저장소를 연결하고, 프로젝트 환경변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록한다. 빌드 명령은 기본값(`npm run build`, 출력 `dist/`) 그대로 사용하면 된다.

## 저작권 원칙

- 기사 본문 전체를 저장하거나 표시하지 않는다.
- 제목, RSS가 공식 제공하는 짧은 요약, 원문 링크만 사용한다.
- 데일리 브리핑은 원문을 그대로 복사하지 않고 재구성한 문장으로 작성하며, 항목마다 언론사명과 원문 링크를 표기한다.
- 연합뉴스 RSS는 피드 자체에 "AI 학습 및 활용 금지" 문구가 명시되어 있음을 인지한 상태로, 우선 포함하고 추후 재검토하기로 결정함 (2026-08-02).
