import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the default funnel (AcneScope) in development
  // In production, each domain will route to its specific funnel via middleware
  redirect('/acnescope')
}
