-- 경제줍줍: 회원가입/로그인 도입 1단계 — 프로필 테이블
-- 아이디(username)+비밀번호로 가입/로그인하지만, Supabase Auth는 이메일 기반이라
-- 프론트에서 username을 `${username}@users.internal` 형태의 내부용 이메일로 변환해 사용한다.
-- (src/lib/username.js 참고). auth.users는 그 가짜 이메일/비밀번호만 갖고,
-- 실제로 화면에 노출되는 아이디/닉네임은 이 profiles 테이블에 보관한다.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  nickname text not null,
  created_at timestamptz not null default now(),
  check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  check (char_length(nickname) between 1 and 20)
);

alter table profiles enable row level security;

-- 댓글/퀴즈 순위표 등에 닉네임을 표시해야 하므로 전체 공개 읽기
drop policy if exists "public read profiles" on profiles;
create policy "public read profiles" on profiles
  for select
  to anon, authenticated
  using (true);

-- 본인 프로필만 수정 가능 (닉네임 변경 용도). insert 정책은 만들지 않는다:
-- 신규 유저의 profiles 행은 아래 트리거가 SECURITY DEFINER로 대신 생성한다.
drop policy if exists "user update own profile" on profiles;
create policy "user update own profile" on profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 회원가입(auth.users insert) 시 signUp의 options.data로 넘긴 username/nickname을
-- profiles에 자동 복사한다. (Supabase 공식 권장 패턴)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, nickname)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'username')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
