import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { ApiError, apiRequest } from "@/lib/api"
import type { NeighborhoodRequest, NeighborhoodResponse } from "@/types/neighborhood"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// ─── Zod schema ────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nicheComMappedName: z.string().optional(),
  letterGrade: z.string().optional(),
  nicheComLetterGrade: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
})

// ─── Form state ────────────────────────────────────────────────────────────────

type FormValues = {
  name: string
  nicheComMappedName: string
  letterGrade: string
  nicheComLetterGrade: string
  city: string
  state: string
  country: string
}

const emptyValues: FormValues = {
  name: "",
  nicheComMappedName: "",
  letterGrade: "",
  nicheComLetterGrade: "",
  city: "",
  state: "",
  country: "",
}

function toFormValues(n: NeighborhoodResponse): FormValues {
  const s = (v: string | null | undefined) => v ?? ""
  return {
    name: n.name,
    nicheComMappedName: s(n.nicheComMappedName),
    letterGrade: s(n.letterGrade),
    nicheComLetterGrade: s(n.nicheComLetterGrade),
    city: s(n.city),
    state: s(n.state),
    country: s(n.country),
  }
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface NeighborhoodSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing neighborhood to open in edit mode; omit for create mode. */
  neighborhood?: NeighborhoodResponse
  onSaved: (result: NeighborhoodResponse) => void
  onDeleted?: (id: number) => void
}

export function NeighborhoodSheet({
  open,
  onOpenChange,
  neighborhood,
  onSaved,
  onDeleted,
}: NeighborhoodSheetProps) {
  const isEdit = !!neighborhood

  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Reset / populate form whenever the sheet opens or the target row changes
  React.useEffect(() => {
    if (!open) return
    setValues(neighborhood ? toFormValues(neighborhood) : emptyValues)
    setErrors({})
    setSubmitting(false)
  }, [open, neighborhood])

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  async function handleSubmit() {
    const result = formSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of result.error.issues) {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    // Coerce empty strings to null for optional fields
    const data = result.data
    const body: NeighborhoodRequest = {
      name: data.name,
      nicheComMappedName: data.nicheComMappedName || null,
      letterGrade: data.letterGrade || null,
      nicheComLetterGrade: data.nicheComLetterGrade || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
    }

    setSubmitting(true)
    try {
      const saved = isEdit
        ? await apiRequest<NeighborhoodResponse>(`/api/neighborhoods/${neighborhood!.id}`, {
            method: "PUT",
            body,
          })
        : await apiRequest<NeighborhoodResponse>("/api/neighborhoods", {
            method: "POST",
            body,
          })

      toast.success(
        isEdit ? "Neighborhood updated successfully." : "Neighborhood created successfully.",
      )
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to ${isEdit ? "update" : "create"} neighborhood: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!neighborhood) return
    setDeleting(true)
    try {
      await apiRequest(`/api/neighborhoods/${neighborhood.id}`, { method: "DELETE" })
      toast.success("Neighborhood deleted.")
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDeleted?.(neighborhood.id)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to delete neighborhood: ${message}`)
    } finally {
      setDeleting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col gap-0 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{isEdit ? "Edit Neighborhood" : "New Neighborhood"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the neighborhood details below, then click Save Changes."
              : "Add a neighborhood to track and compare areas for deal analysis. Name is required — all other fields are optional."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-4">

            {/* Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">
                Name{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Capitol Hill"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                disabled={submitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <Separator />

            {/* Location */}
            <SectionLabel>Location</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Denver"
                  value={values.city}
                  onChange={(e) => setField("city", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g. CO"
                  value={values.state}
                  onChange={(e) => setField("state", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g. US"
                  value={values.country}
                  onChange={(e) => setField("country", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <Separator />

            {/* Niche.com */}
            <SectionLabel>Niche.com</SectionLabel>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="nicheComMappedName">Mapped Name</Label>
                <Input
                  id="nicheComMappedName"
                  placeholder="e.g. capitol-hill-denver-co"
                  value={values.nicheComMappedName}
                  onChange={(e) => setField("nicheComMappedName", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="letterGrade">Letter Grade</Label>
                  <Input
                    id="letterGrade"
                    placeholder="e.g. A+"
                    value={values.letterGrade}
                    onChange={(e) => setField("letterGrade", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="nicheComLetterGrade">Niche.com Grade</Label>
                  <Input
                    id="nicheComLetterGrade"
                    placeholder="e.g. A+"
                    value={values.nicheComLetterGrade}
                    onChange={(e) => setField("nicheComLetterGrade", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {isEdit && (
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && (
              <Loader2Icon className="size-3 animate-spin" aria-hidden />
            )}
            {submitting
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete neighborhood?</DialogTitle>
            <DialogDescription>
              &ldquo;{neighborhood?.name}&rdquo; will be permanently deleted. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && (
                <Loader2Icon className="size-3 animate-spin" aria-hidden />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
