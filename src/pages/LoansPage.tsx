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
import type { LoanResponse } from "@/types/loan"
import { LOAN_TYPE_LABELS } from "@/types/loan"
import { LoanSheet } from "@/components/LoanSheet"
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

const columns: ColumnDef<LoanResponse>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "loanType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary">{LOAN_TYPE_LABELS[row.original.loanType]}</Badge>
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

export function LoansPage() {
  const [data, setData] = React.useState<LoanResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedLoan, setSelectedLoan] = React.useState<
    LoanResponse | undefined
  >()

  React.useEffect(() => {
    apiRequest<LoanResponse[]>("/api/loans")
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load loans.",
        )
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(saved: LoanResponse) {
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

  const nameFilter =
    (table.getColumn("name")?.getFilterValue() as string) ?? ""

  return (
    <>
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              setSelectedLoan(undefined)
              setSheetOpen(true)
            }}
          >
            <PlusIcon />
            New Loan
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
                        setSelectedLoan(row.original)
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
                        ? "No loans match your search."
                        : "No loans yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <LoanSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        loan={selectedLoan}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
