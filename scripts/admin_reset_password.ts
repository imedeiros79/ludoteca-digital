
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file explicitly
const envPath = path.resolve(process.cwd(), '.env')
console.log(`Loading env from: ${envPath}`)
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing Supabase URL or Service Role Key.')
    console.log('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env')
    process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const targetEmail = 'imedeiros@outlook.com'
const newPassword = 'Password123!'

async function resetPassword() {
    console.log(`\nConnecting to Supabase at: ${supabaseUrl}`)
    console.log(`Searching for user: ${targetEmail}...`)

    // listUsers() returns a paginated list, we might need to search properly
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    const users = data.users
    const user = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())

    if (!user) {
        console.error(`User ${targetEmail} not found in the database.`)
        console.log(`Total users found: ${users.length}`)
        if (users.length > 0) {
            console.log('First 5 users found:')
            users.slice(0, 5).forEach(u => console.log(`- ${u.email} (ID: ${u.id})`))
        }
        return
    }

    console.log(`User found (ID: ${user.id}). Updating password to: ${newPassword}`)

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    )

    if (error) {
        console.error('Error updating password:', error.message)
    } else {
        console.log('\nSUCCESS! Password updated successfully.')
        console.log('---------------------------------------------------')
        console.log(`Email: ${targetEmail}`)
        console.log(`New Password: ${newPassword}`)
        console.log('Please try logging in with these credentials.')
        console.log('---------------------------------------------------')
    }
}

resetPassword()
