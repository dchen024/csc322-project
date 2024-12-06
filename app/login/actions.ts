'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // You might want to handle this error more gracefully
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  console.log('signup', formData.get('email'), formData.get('password'), formData.get('username'))

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    // You might want to handle this error more gracefully
    console.log('error', error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}