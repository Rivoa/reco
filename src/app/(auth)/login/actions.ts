'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // We redirect back to login with the error message in the URL
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Success: Redirect to the dashboard
  return redirect('/')
}