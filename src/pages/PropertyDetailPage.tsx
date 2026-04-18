import * as React from "react"
import { Link, useParams } from "react-router-dom"
import {
  Building2, MapPin, Calendar, ExternalLink,
  Check, X, Fuel, GraduationCap, School, ShoppingCart,
  Stethoscope, Leaf, Bus, Bike, Star, PersonStanding,
} from "lucide-react"

import { ApiError, apiRequest } from "@/lib/api"
import type { PropertyDetailResponse, PropertyResponse, UnitResponse } from "@/types/property"
import { PageHeaderContext } from "@/components/PageLayout"
import { PropertyTypeBadge, StatusBadge } from "@/components/property-badges"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, prefix = "", suffix = ""): string {
  if (val == null) return "—"
  return `${prefix}${val.toLocaleString()}${suffix}`
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—"
  return new Date(val).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function bool(val: boolean | null | undefined): React.ReactNode {
  if (val == null) return <span className="text-muted-foreground">—</span>
  return val ? (
    <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
  ) : (
    <span className="text-muted-foreground">No</span>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-muted-foreground text-sm">—</span>
  const color =
    score >= 70
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
      : score >= 40
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

function BoolIcon({ val }: { val: boolean | null | undefined }) {
  if (val == null) return <span className="text-muted-foreground text-sm">—</span>
  return val ? (
    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
      <Check className="h-3.5 w-3.5 stroke-[2.5]" />Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
      <X className="h-3.5 w-3.5 stroke-[2.5]" />No
    </span>
  )
}

function BoolIconAlert({ val }: { val: boolean | null | undefined }) {
  if (val == null) return <span className="text-muted-foreground text-sm">—</span>
  return val ? (
    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium text-sm">
      <X className="h-3.5 w-3.5 stroke-[2.5]" />Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
      <Check className="h-3.5 w-3.5 stroke-[2.5]" />No
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-semibold text-right text-foreground">
        {value ?? <span className="text-muted-foreground font-normal">—</span>}
      </span>
    </div>
  )
}

function NoteBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-4 rounded-lg bg-muted/25 border border-border/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/85">{content}</p>
    </div>
  )
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`flex flex-col overflow-hidden border border-border/60 bg-card/50 backdrop-blur-sm ${className ?? ""}`}>
      {title && (
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 px-5 pb-5 pt-4">{children}</CardContent>
    </Card>
  )
}

// ─── Amenity icon map ─────────────────────────────────────────────────────────

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Gas Station": <Fuel className="h-3.5 w-3.5" />,
  "School":      <School className="h-3.5 w-3.5" />,
  "University":  <GraduationCap className="h-3.5 w-3.5" />,
  "Grocery":     <ShoppingCart className="h-3.5 w-3.5" />,
  "Hospital":    <Stethoscope className="h-3.5 w-3.5" />,
  "Park":        <Leaf className="h-3.5 w-3.5" />,
  "Transit":     <Bus className="h-3.5 w-3.5" />,
}

// ─── Skeleton loading state ───────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { setHeader } = React.useContext(PageHeaderContext)

  const [detail, setDetail] = React.useState<PropertyDetailResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    apiRequest<PropertyDetailResponse>(`/api/properties/${id}`)
      .then(setDetail)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load property.")
      )
      .finally(() => setLoading(false))
  }, [id])

  React.useEffect(() => {
    const address = detail?.property.fullAddress ?? detail?.property.address1 ?? "Property"
    setHeader(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/properties">Properties</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{loading ? "Loading…" : address}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }, [detail, loading, setHeader])

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="px-4 py-6 lg:px-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!detail) return null

  const p: PropertyResponse = detail.property
  const units: UnitResponse[] = detail.units

  const amenities = [
    { label: "Gas Station",   dist: p.gasStationDistanceMiles,     count: p.gasStationCount5mi },
    { label: "School",        dist: p.schoolDistanceMiles,         count: p.schoolCount5mi },
    { label: "University",    dist: p.universityDistanceMiles,     count: p.universityCount5mi },
    { label: "Grocery",       dist: p.groceryStoreDistanceMiles,   count: p.groceryStoreCount5mi },
    { label: "Hospital",      dist: p.hospitalDistanceMiles,       count: p.hospitalCount5mi },
    { label: "Park",          dist: p.parkDistanceMiles,           count: p.parkCount5mi },
    { label: "Transit",       dist: p.transitStationDistanceMiles, count: p.transitStationCount5mi },
  ].filter((a) => a.dist != null || a.count != null)

  const hasAmenities = amenities.length > 0

  const keyStats = [
    { label: "Asking Price", value: p.purchasePrice != null ? fmt(p.purchasePrice, "$") : null, primary: true },
    { label: "Beds",         value: p.beds != null ? String(p.beds) : null },
    { label: "Baths",        value: p.baths != null ? String(p.baths) : null },
    { label: "Sq Ft",        value: p.squareFt != null ? fmt(p.squareFt) : null },
    { label: "Year Built",   value: p.builtIn != null ? String(p.builtIn) : null },
    { label: "Units",        value: p.units != null && p.units > 1 ? String(p.units) : null },
  ].filter((s) => s.value != null)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8 max-w-7xl">

      {/* ── Hero section with address and key metrics ──────────────────────── */}
      <div className="space-y-5">
        
        {/* Address + Badges */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {p.fullAddress ?? p.address1}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={p.status} />
              <PropertyTypeBadge units={p.units} />
            </div>
          </div>

          {/* Location + meta info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {(p.city || p.state || p.zipCode) && (
              <span className="flex items-center gap-1.5 text-foreground/70">
                <MapPin className="h-4 w-4 stroke-[1.5]" />
                {[p.city, p.state, p.zipCode].filter(Boolean).join(", ")}
              </span>
            )}
            {p.county && (
              <span className="flex items-center gap-1.5 text-foreground/70">
                <Building2 className="h-4 w-4 stroke-[1.5]" />
                {p.county} County
              </span>
            )}
            {p.listedDate && (
              <span className="flex items-center gap-1.5 text-foreground/70">
                <Calendar className="h-4 w-4 stroke-[1.5]" />
                Listed {fmtDate(p.listedDate)}
              </span>
            )}
            {p.zillowLink && (
              <a
                href={p.zillowLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <ExternalLink className="h-4 w-4 stroke-[1.5]" />
                View on Zillow
              </a>
            )}
          </div>
        </div>

        {/* Key stat tiles - Grid layout */}
        {keyStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {keyStats.map((s) => (
              <div
                key={s.label}
                className={`flex flex-col rounded-lg p-4 transition-colors ${
                  s.primary
                    ? "bg-primary/8 border border-primary/20"
                    : "bg-muted/50 border border-border/60"
                }`}
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">{s.label}</span>
                <span className={`font-bold tabular-nums leading-tight ${s.primary ? "text-lg text-primary" : "text-base text-foreground"}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 1: Financials ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Financial Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Acquisition" className="">
            <DetailRow label="Purchase Price"    value={fmt(p.purchasePrice, "$")} />
            <DetailRow label="Annual Tax"        value={fmt(p.annualTaxAmount, "$")} />
            <DetailRow label="Electricity (est)" value={fmt(p.annualElectricityCostEst, "$", "/yr")} />
            <DetailRow label="FSBO"              value={<BoolIcon val={p.isFsbo} />} />
            <DetailRow label="Avg Ownership"     value={p.averageOwnershipDuration != null ? `${p.averageOwnershipDuration} yrs` : null} />
          </SectionCard>
          
          <SectionCard title="Rental Income" className="">
            <DetailRow label="Rent Estimate" value={
              p.rentEstimate != null ? `${fmt(p.rentEstimate, "$")}/mo` : null
            } />
            <DetailRow label="Rent Range" value={
              p.rentEstimateLow != null && p.rentEstimateHigh != null
                ? `${fmt(p.rentEstimateLow, "$")} – ${fmt(p.rentEstimateHigh, "$")}`
                : null
            } />
            <DetailRow label="Est. Value"   value={p.estPrice != null ? fmt(p.estPrice, "$") : null} />
            <DetailRow label="Value Range"  value={
              p.estPriceLow != null && p.estPriceHigh != null
                ? `${fmt(p.estPriceLow, "$")} – ${fmt(p.estPriceHigh, "$")}`
                : null
            } />
            <DetailRow label="Last Sale"    value={
              p.lastPurchasePrice != null
                ? `${fmt(p.lastPurchasePrice, "$")}${p.lastPurchaseDate ? ` · ${fmtDate(p.lastPurchaseDate)}` : ""}`
                : null
            } />
          </SectionCard>
        </div>
      </div>

      {/* ── Row 2: Scores & Location ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Market & Location Scores</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <SectionCard title="Walkability Scores">
            <DetailRow label="Walk Score" value={<ScoreBadge score={p.walkScore} />} />
            <DetailRow label="Transit Score" value={<ScoreBadge score={p.transitScore} />} />
            <DetailRow label="Bike Score" value={<ScoreBadge score={p.bikeScore} />} />
          </SectionCard>

          <SectionCard title="Property Condition">
            {p.propertyConditionScore != null && (
              <div className="mb-4">
                <label className="text-sm text-muted-foreground block mb-2">Condition Score</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (p.propertyConditionScore ?? 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted stroke-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            <DetailRow label="Has Tenants"     value={<BoolIcon val={p.hasTenants} />} />
            <DetailRow label="Reduced Price"   value={<BoolIcon val={p.hasReducedPrice} />} />
            <DetailRow label="Rent DD Done"    value={<BoolIcon val={p.rentDdCompleted} />} />
            <DetailRow label="Market Research" value={<BoolIcon val={p.hasMarketResearch} />} />
          </SectionCard>

          <SectionCard title="Location Data">
            {p.lat != null && p.lon != null && (
              <DetailRow label="Coordinates" value={`${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`} />
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Row 3: Amenities ──────────────────────────────────────────────── */}
      {hasAmenities && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Nearby Amenities</h2>
          <SectionCard title="">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenities.map(({ label, dist, count }) => (
                <div
                  key={label}
                  className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <span className="text-primary">{AMENITY_ICONS[label]}</span>
                    {label}
                  </span>
                  <div className="space-y-1">
                    {dist != null && (
                      <p className="text-sm font-semibold text-foreground">
                        {dist} <span className="text-xs text-muted-foreground">mi away</span>
                      </p>
                    )}
                    {count != null && (
                      <p className="text-xs text-muted-foreground">{count} within 5 miles</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Row 4: Due Diligence & Legal ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Due Diligence & Legal</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Legal & Permits">
            <DetailRow label="County Records"    value={<BoolIcon val={p.obtainedCountyRecords} />} />
            <DetailRow label="Deed Restrictions" value={<BoolIconAlert val={p.hasDeedRestrictions} />} />
            <DetailRow label="HOA"               value={<BoolIconAlert val={p.hasHao} />} />
            <DetailRow label="Historic Preserve" value={<BoolIconAlert val={p.hasHistoricPreservation} />} />
            <DetailRow label="Flood Zone"        value={<BoolIconAlert val={p.inFloodZone} />} />
            <DetailRow label="Easements"         value={p.hasEasements ? (p.easements || bool(true)) : bool(false)} />
            <DetailRow label="Setbacks"          value={p.setbacks || null} />
            <DetailRow label="Open Permits"      value={<BoolIconAlert val={p.hasOpenPulledPermits} />} />
            <DetailRow label="Work w/o Permits"  value={<BoolIconAlert val={p.hasWorkDoneWoPermits} />} />
            <DetailRow
              label="Turnover Rate"
              value={p.historicalTurnoverRate != null ? `${(p.historicalTurnoverRate * 100).toFixed(1)}%` : null}
            />
            {p.countyRecordNotes && <NoteBlock title="County Record Notes" content={p.countyRecordNotes} />}
          </SectionCard>

          <SectionCard title="Research & Notes">
            {p.sellerCircumstances && (
              <DetailRow
                label="Seller Situation"
                value={p.sellerCircumstances
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              />
            )}
            {p.reasonForPassing && (
              <NoteBlock title="Reason for Passing" content={p.reasonForPassing} />
            )}
            {p.propertyNotes && (
              <NoteBlock title="Property Notes" content={p.propertyNotes} />
            )}
            {p.whitepagesNotes && (
              <NoteBlock title="Whitepages Notes" content={p.whitepagesNotes} />
            )}
            {!p.sellerCircumstances && !p.reasonForPassing && !p.propertyNotes && !p.whitepagesNotes && (
              <p className="text-sm text-muted-foreground py-2">No notes recorded.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Units ────────────────────────────────────────────────────────── */}
      {units.length > 0 && (
        <SectionCard title={`Units · ${units.length}`}>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Unit #</TableHead>
                  <TableHead className="font-semibold text-foreground">Beds</TableHead>
                  <TableHead className="font-semibold text-foreground">Baths</TableHead>
                  <TableHead className="font-semibold text-foreground">Sq Ft</TableHead>
                  <TableHead className="font-semibold text-foreground">Rent Est.</TableHead>
                  <TableHead className="font-semibold text-foreground">Rent Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((u, idx) => (
                  <TableRow key={u.id} className={idx % 2 !== 0 ? "bg-muted/20" : ""}>
                    <TableCell className="font-semibold">{u.unitNum}</TableCell>
                    <TableCell>{u.beds ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{u.baths ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {u.estimatedSqrft != null
                        ? u.estimatedSqrft.toLocaleString()
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-medium">
                      {u.rentEstimate != null
                        ? `$${u.rentEstimate.toLocaleString()}`
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {u.rentEstimateLow != null && u.rentEstimateHigh != null
                        ? `$${u.rentEstimateLow.toLocaleString()} – $${u.rentEstimateHigh.toLocaleString()}`
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

    </div>
  )
}
