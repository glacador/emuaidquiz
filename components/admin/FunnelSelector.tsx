'use client'

interface FunnelSelectorProps {
  funnels: { id: string; name: string }[]
  selectedFunnelId?: string
  redirectPath: string
}

export default function FunnelSelector({ funnels, selectedFunnelId, redirectPath }: FunnelSelectorProps) {
  return (
    <select
      defaultValue={selectedFunnelId || ''}
      onChange={(e) => {
        if (e.target.value) {
          window.location.href = `${redirectPath}?funnel=${e.target.value}`
        }
      }}
      className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Choose a funnel...</option>
      {funnels.map((funnel) => (
        <option key={funnel.id} value={funnel.id}>
          {funnel.name}
        </option>
      ))}
    </select>
  )
}
