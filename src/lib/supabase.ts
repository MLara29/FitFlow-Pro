import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** `null` enquanto as variáveis não estiverem em .env.local: o app roda em modo local (localStorage). */
export const supabase = url && key ? createClient(url, key) : null
