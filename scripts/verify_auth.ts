
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
    const email = 'test_login_' + Date.now() + '@example.com'
    const password = 'Password123!'

    console.log(`\n1. Creating user ${email}...`)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (signUpError) {
        console.error('SignUp Error:', signUpError.message)
        return
    }
    console.log('SignUp Success.')

    console.log(`\n2. Attempting login with CORRECT password...`)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (signInError) {
        console.error('SignIn (Correct) Error:', signInError.message)
        console.error('Details:', JSON.stringify(signInError, null, 2))
    } else {
        console.log('SignIn (Correct) Success:', signInData.session?.access_token ? 'Token received' : 'No token')
    }

    console.log(`\n3. Attempting login with WRONG password...`)
    const { error: wrongPassError } = await supabase.auth.signInWithPassword({
        email,
        password: 'WrongPassword123!',
    })

    if (wrongPassError) {
        console.log('SignIn (Wrong Pass) Error Message:', wrongPassError.message)
        console.log('SignIn (Wrong Pass) Status:', wrongPassError.status)
    } else {
        console.error('SignIn (Wrong Pass) unexpectedly succeeded!')
    }
}

testAuth()
