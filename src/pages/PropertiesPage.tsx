import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { ApiError, apiRequest } from "@/lib/api"
import type { PropertyResponse } from "@/types/property"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PropertyTypeBadge, StatusBadge } from "@/components/property-badges"

const PAGE_SIZE = 100

// ─── Sort button ──────────────────────────────────────────────────────────────

interface FetchParams {
  page: number
  search: string
  sortBy: string
  sortDir: "ASC" | "DESC"
}

interface SortButtonProps {
  column: string
  label: string
  params: FetchParams
  onSort: (col: string) => void
}

function SortButton({ column, label, params, onSort }: SortButtonProps) {
  const isActive = params.sortBy === column
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(column)}
    >
      {label}
      {isActive ? (
        params.sortDir === "ASC"
          ? <ArrowUp className="h-3 w-3" />
          : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PropertiesPage() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<PropertyResponse[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // All fetch-triggering state in one object — single useEffect dep
  const [params, setParams] = React.useState<FetchParams>({
    page: 0,
    search: "",
    sortBy: "",
    sortDir: "DESC",
  })

  // Raw search input value (debounced into params.search)
  const [searchInput, setSearchInput] = React.useState("")

  const sentinelRef = React.useRef<HTMLDivElement>(null)
  // Generation counter: stale responses from superseded requests are dropped
  const fetchGenRef = React.useRef(0)

  // ── Debounce search input → params ──────────────────────────────────────────
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParams((p) => {
        if (p.search === searchInput) return p
        return { ...p, page: 0, search: searchInput }
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ── Fetch whenever params change ────────────────────────────────────────────
  React.useEffect(() => {
    const gen = ++fetchGenRef.current
    setLoading(true)
    if (params.page === 0) {
      setHasMore(true)
      setError(null)
    }

    const qs = new URLSearchParams({
      page: String(params.page),
      size: String(PAGE_SIZE),
      ...(params.search  && { q:       params.search }),
      ...(params.sortBy  && { sortBy:  params.sortBy }),
      ...(params.sortDir && { sortDir: params.sortDir }),
    })

    apiRequest<PropertyResponse[]>(`/api/properties?${qs}`)
      .then((rows) => {
        if (gen !== fetchGenRef.current) return
        setData((prev) => (params.page === 0 ? rows : [...prev, ...rows]))
        if (rows.length < PAGE_SIZE) setHasMore(false)
      })
      .catch((err) => {
        if (gen !== fetchGenRef.current) return
        setError(err instanceof ApiError ? err.message : "Failed to load properties.")
      })
      .finally(() => {
        if (gen === fetchGenRef.current) setLoading(false)
      })
  }, [params])

  // ── IntersectionObserver — load next page on scroll ─────────────────────────
  React.useEffect(() => {
    if (!hasMore || loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setParams((p) => ({ ...p, page: p.page + 1 }))
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, data.length])

  // ── Sort handler ─────────────────────────────────────────────────────────────
  const handleSort = React.useCallback((column: string) => {
    setParams((p) => ({
      ...p,
      page: 0,
      sortBy: column,
      sortDir: p.sortBy === column && p.sortDir === "ASC" ? "DESC" : "ASC",
    }))
  }, [])

  // ── Column definitions (re-memoized when params or handleSort changes) ───────
  const columns: ColumnDef<PropertyResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "address1",
        header: () => (
          <SortButton column="address1" label="Address" params={params} onSort={handleSort} />
        ),
      },
      {
        accessorKey: "city",
        header: () => (
          <SortButton column="city" label="City" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.city ?? <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "zipCode",
        header: () => (
          <SortButton column="zipCode" label="Zip Code" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.zipCode ?? <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "beds",
        header: () => (
          <SortButton column="beds" label="Beds" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.beds != null
            ? row.original.beds
            : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "baths",
        header: () => (
          <SortButton column="baths" label="Baths" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.baths != null
            ? row.original.baths
            : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "squareFt",
        header: () => (
          <SortButton column="squareFt" label="Sq Ft" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.squareFt != null
            ? row.original.squareFt.toLocaleString()
            : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "purchasePrice",
        header: () => (
          <SortButton column="purchasePrice" label="Asking Price" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) =>
          row.original.purchasePrice != null
            ? `$${row.original.purchasePrice.toLocaleString()}`
            : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "units",
        header: "Type",
        cell: ({ row }) => <PropertyTypeBadge units={row.original.units} />,
      },
      {
        accessorKey: "status",
        header: () => (
          <SortButton column="status" label="Status" params={params} onSort={handleSort} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [params, handleSort],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by address…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/properties/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {params.search ? "No properties match your search." : "No properties yet."}
                  </TableCell>
                </TableRow>
              )}

              {loading && data.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-3 text-center text-sm text-muted-foreground"
                  >
                    Loading more…
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sentinel — enters viewport to trigger next page load */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  )
}
