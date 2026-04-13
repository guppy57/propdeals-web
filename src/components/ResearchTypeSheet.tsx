import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { ApiError, apiRequest } from "@/lib/api"
import type { ResearchTypeRequest, ResearchTypeResponse } from "@/types/research-type"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
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
  researchType: z.string().min(1, "Research type name is required"),
  prompt: z.string().min(1, "Prompt is required"),
})

// ─── Form state ────────────────────────────────────────────────────────────────

type FormValues = {
  researchType: string
  prompt: string
}

const emptyValues: FormValues = {
  researchType: "",
  prompt: "",
}

function toFormValues(rt: ResearchTypeResponse): FormValues {
  return {
    researchType: rt.researchType,
    prompt: rt.prompt,
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface ResearchTypeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing research type to open in edit mode; omit for create mode. */
  researchType?: ResearchTypeResponse
  onSaved: (result: ResearchTypeResponse) => void
  onDeleted?: (id: string) => void
}

export function ResearchTypeSheet({
  open,
  onOpenChange,
  researchType,
  onSaved,
  onDeleted,
}: ResearchTypeSheetProps) {
  const isEdit = !!researchType

  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Reset / populate form whenever the sheet opens or the target row changes
  React.useEffect(() => {
    if (!open) return
    setValues(researchType ? toFormValues(researchType) : emptyValues)
    setErrors({})
    setSubmitting(false)
  }, [open, researchType])

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
      for (const err of result.error.errors) {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    const body: ResearchTypeRequest = {
      researchType: result.data.researchType,
      prompt: result.data.prompt,
    }

    setSubmitting(true)
    try {
      const saved = isEdit
        ? await apiRequest<ResearchTypeResponse>(`/api/research-types/${researchType!.id}`, {
            method: "PUT",
            body,
          })
        : await apiRequest<ResearchTypeResponse>("/api/research-types", {
            method: "POST",
            body,
          })

      toast.success(
        isEdit ? "Research type updated successfully." : "Research type created successfully.",
      )
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to ${isEdit ? "update" : "create"} research type: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!researchType) return
    setDeleting(true)
    try {
      await apiRequest(`/api/research-types/${researchType.id}`, { method: "DELETE" })
      toast.success("Research type deleted.")
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDeleted?.(researchType.id)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to delete research type: ${message}`)
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
          <SheetTitle>{isEdit ? "Edit Research Type" : "New Research Type"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the research type details below, then click Save Changes."
              : "Define a research type with a name and an AI prompt template used to generate property reports."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-4">

            {/* Research Type Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="researchType">
                Name{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="researchType"
                placeholder="e.g. Neighborhood Safety Analysis"
                value={values.researchType}
                onChange={(e) => setField("researchType", e.target.value)}
                disabled={submitting}
              />
              {errors.researchType && (
                <p className="text-xs text-destructive">{errors.researchType}</p>
              )}
            </div>

            {/* Prompt */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="prompt">
                Prompt{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <textarea
                id="prompt"
                rows={8}
                placeholder="Write the AI prompt template used to generate this report..."
                value={values.prompt}
                onChange={(e) => setField("prompt", e.target.value)}
                disabled={submitting}
                className={cn(
                  "w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none resize-y",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
                  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:bg-input/30",
                  errors.prompt && "border-destructive ring-2 ring-destructive/20",
                )}
              />
              {errors.prompt && (
                <p className="text-xs text-destructive">{errors.prompt}</p>
              )}
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
            <DialogTitle>Delete research type?</DialogTitle>
            <DialogDescription>
              &ldquo;{researchType?.researchType}&rdquo; will be permanently deleted. This
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
