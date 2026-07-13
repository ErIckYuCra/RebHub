import { createClient } from '@supabase/supabase-js'
import type { Database } from '@readhub/types'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabase = createClient<Database>(url, key)
