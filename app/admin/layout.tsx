// Root admin layout - just passes through to route groups
// Auth is handled by (dashboard) and (auth) route group layouts
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
