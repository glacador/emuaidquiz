import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if accessing login page
  const isLoginPage = false // Will be handled by segment

  if (!user && !isLoginPage) {
    redirect('/admin/login')
  }

  // If on login page, just render children without layout
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar user={user} />
      <main className="flex-1 p-8 ml-64">
        {children}
      </main>
    </div>
  )
}
