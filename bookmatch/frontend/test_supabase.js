import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim())

async function test() {
  const { data: upsertData, error: upsertError } = await supabase.from('user_profiles').upsert({
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test",
    liked_genres: ["fantasy"],
    liked_tropes: ["magic"]
  })
  console.log("Upsert error:", upsertError)
  console.log("Upsert data:", upsertData)
}

test()
