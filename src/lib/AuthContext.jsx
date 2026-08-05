import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, username, nickname')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (cancelled) return
      setSession(initialSession)
      loadProfile(initialSession?.user?.id).finally(() => {
        if (!cancelled) setLoading(false)
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadProfile(nextSession?.user?.id)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  // 트리거로 profiles 행이 생기기 전에도(가입 직후) 닉네임을 바로 화면에 반영하기 위한 낙관적 업데이트
  const setProfileOptimistic = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  const refreshProfile = useCallback(() => loadProfile(session?.user?.id), [loadProfile, session])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut,
    setProfileOptimistic,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
