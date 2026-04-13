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
import type { ResearchTypeResponse } from "@/types/research-type"
import { ResearchTypeSheet } from "@/components/ResearchTypeSheet"
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

const columns: ColumnDef<ResearchTypeResponse>[] = [
  {
    accessorKey: "researchType",
    header: "Research Type",
    cell: ({ row }) =>
      row.original.researchType.charAt(0).toUpperCase() +
      row.original.researchType.slice(1),
  },
  {
    accessorKey: "prompt",
    header: "Prompt",
    cell: ({ row }) => {
      const prompt = row.original.prompt
      return prompt.length > 80 ? (
        <span className="text-muted-foreground">{prompt.slice(0, 80)}…</span>
      ) : (
        <span className="text-muted-foreground">{prompt}</span>
      )
    },
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

export function ResearchTypesPage() {
  const [data, setData] = React.useState<ResearchTypeResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedResearchType, setSelectedResearchType] = React.useState<
    ResearchTypeResponse | undefined
  >()

  React.useEffect(() => {
    apiRequest<ResearchTypeResponse[]>("/api/research-types")
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load research types.",
        )
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(saved: ResearchTypeResponse) {
    setData((prev) =>
      prev.some((item) => item.id === saved.id)
        ? prev.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev],
    )
  }

  function handleDeleted(id: string) {
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

  const nameFilter =
    (table.getColumn("researchType")?.getFilterValue() as string) ?? ""

  return (
    <>
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) =>
              table.getColumn("researchType")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              setSelectedResearchType(undefined)
              setSheetOpen(true)
            }}
          >
            <PlusIcon />
            New Research Type
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
                        setSelectedResearchType(row.original)
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
                      {nameFilter
                        ? "No research types match your search."
                        : "No research types yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ResearchTypeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        researchType={selectedResearchType}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
