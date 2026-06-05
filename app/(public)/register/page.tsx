import type { Metadata } from 'next'
import { RegisterForm } from '@/components/register-form'

export const metadata: Metadata = {
  title: 'Register',
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <RegisterForm />
    </div>
  )
}
