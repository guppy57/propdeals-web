import * as React from "react"
import { PlusIcon } from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table"

import { ApiError, apiRequest } from "@/lib/api"
import type { AssumptionSetResponse } from "@/types/assumption-set"
import { AssumptionSetSheet } from "@/components/AssumptionSetSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const columns: ColumnDef<AssumptionSetResponse>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <Badge variant={row.original.segment === "LTR" ? "default" : "secondary"}>
        {row.original.segment === "LTR" ? "Long-Term Rental" : "Fix & Flip"}
      </Badge>
    ),
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.isDefault ? "Yes" : "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
]

export function AssumptionSetsPage() {
  const [data, setData] = React.useState<AssumptionSetResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedSet, setSelectedSet] = React.useState<
    AssumptionSetResponse | undefined
  >()

  React.useEffect(() => {
    apiRequest<AssumptionSetResponse[]>("/api/assumption-sets")
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load assumption sets.",
        )
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(saved: AssumptionSetResponse) {
    setData((prev) =>
      prev.some((item) => item.id === saved.id)
        ? prev.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev],
    )
  }

  function handleDeleted(id: number) {
    setData((prev) => prev.filter((item) => item.id !== id))
  }

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const descriptionFilter =
    (table.getColumn("description")?.getFilterValue() as string) ?? ""

  return (
    <>
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search by description..."
            value={descriptionFilter}
            onChange={(e) =>
              table.getColumn("description")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              setSelectedSet(undefined)
              setSheetOpen(true)
            }}
          >
            <PlusIcon />
            New Assumption Set
          </Button>
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
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
                      onClick={() => {
                        setSelectedSet(row.original)
                        setSheetOpen(true)
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
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
                      {descriptionFilter
                        ? "No assumption sets match your search."
                        : "No assumption sets yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AssumptionSetSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        assumptionSet={selectedSet}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
