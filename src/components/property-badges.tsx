import type { PropertyStatus } from "@/types/property"
import { PROPERTY_STATUS_LABELS } from "@/types/property"

// ─── Property type badge ──────────────────────────────────────────────────────

const PROPERTY_TYPE_STYLES: Record<string, string> = {
  SFH:    "bg-sky-100 text-sky-700",
  "2PLX": "bg-violet-100 text-violet-700",
  "3PLX": "bg-purple-100 text-purple-700",
  "4PLX": "bg-fuchsia-100 text-fuchsia-700",
}

export function getPropertyTypeLabel(units: number | null | undefined): string {
  if (units == null || units <= 1) return "SFH"
  if (units === 2) return "2PLX"
  if (units === 3) return "3PLX"
  if (units === 4) return "4PLX"
  return `${units} Units`
}

export function PropertyTypeBadge({ units }: { units: number | null | undefined }) {
  const label = getPropertyTypeLabel(units)
  const style = PROPERTY_TYPE_STYLES[label] ?? "bg-amber-100 text-amber-700"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PropertyStatus, string> = {
  ACTIVE:       "bg-green-100 text-green-700",
  ACCEPTED:     "bg-emerald-100 text-emerald-700",
  PENDING_SALE: "bg-blue-100 text-blue-700",
  OFF_MARKET:   "bg-gray-100 text-gray-500",
  PASSED:       "bg-orange-100 text-orange-700",
  SOLD:         "bg-zinc-800 text-zinc-100",
}

export function StatusBadge({ status }: { status: PropertyStatus | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {PROPERTY_STATUS_LABELS[status] ?? status}
    </span>
  )
}
