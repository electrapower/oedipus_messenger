import { createClient } from '@supabase/supabase-js'
import process from 'node:process'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('не хватает NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const emails = [
  'test@example.com',
]

async function inviteAll() {
  for (const email of emails) {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://oedipus-messenger.vercel.app/auth/callback',
    })

    if (error) {
      console.error(`ERROR: ${email} -> ${error.message}`)
    } else {
      console.log(`INVITED: ${email}`)
    }
  }
}

inviteAll()
  .then(() => {
    console.log('Готово')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })