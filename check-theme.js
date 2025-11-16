const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTheme() {
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .like('key', 'theme_%')
  
  console.log('Theme settings in database:')
  data?.forEach(s => console.log(`${s.key}: ${s.value}`))
}

checkTheme()
