import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { ApiError, apiRequest } from "@/lib/api"
import type { LoanRequest, LoanResponse, LoanType } from "@/types/loan"
import { LOAN_TYPE_LABELS } from "@/types/loan"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// ─── Zod schema ────────────────────────────────────────────────────────────────

function numField() {
  return z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().finite("Must be a valid number").optional().nullable(),
  )
}

const LOAN_TYPES = [
  "CONVENTIONAL",
  "FHA",
  "DSCR",
  "SBA_7A",
  "HARD_MONEY",
  "SELLER_FINANCE",
  "CASH",
] as const

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isDefault: z.boolean().optional(),
  interestRate: numField(),
  aprRate: numField(),
  downPaymentRate: numField(),
  years: numField(),
  mipUpfrontRate: numField(),
  mipAnnualRate: numField(),
  upfrontDiscounts: numField(),
  lenderFees: numField(),
  pmiAmountOverride: numField(),
  points: numField(),
})

// ─── Form state ────────────────────────────────────────────────────────────────

type StringField = Exclude<keyof FormValues, "name" | "isDefault">

type FormValues = {
  name: string
  isDefault: boolean
  interestRate: string
  aprRate: string
  downPaymentRate: string
  years: string
  mipUpfrontRate: string
  mipAnnualRate: string
  upfrontDiscounts: string
  lenderFees: string
  pmiAmountOverride: string
  points: string
}

const emptyValues: FormValues = {
  name: "",
  isDefault: false,
  interestRate: "",
  aprRate: "",
  downPaymentRate: "",
  years: "",
  mipUpfrontRate: "",
  mipAnnualRate: "",
  upfrontDiscounts: "",
  lenderFees: "",
  pmiAmountOverride: "",
  points: "",
}

function toFormValues(l: LoanResponse): FormValues {
  const n = (v: number | null | undefined) => (v == null ? "" : String(v))
  return {
    name: l.name,
    isDefault: l.isDefault,
    interestRate: n(l.interestRate),
    aprRate: n(l.aprRate),
    downPaymentRate: n(l.downPaymentRate),
    years: n(l.years),
    mipUpfrontRate: n(l.mipUpfrontRate),
    mipAnnualRate: n(l.mipAnnualRate),
    upfrontDiscounts: n(l.upfrontDiscounts),
    lenderFees: n(l.lenderFees),
    pmiAmountOverride: n(l.pmiAmountOverride),
    points: n(l.points),
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

interface NumInputProps {
  id: string
  label: string
  field: StringField
  values: FormValues
  errors: Record<string, string>
  submitting: boolean
  setField: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
}

function NumInput({
  id,
  label,
  field,
  values,
  errors,
  submitting,
  setField,
}: NumInputProps) {
  const isRate = /rate/i.test(label)
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder="—"
          value={values[field]}
          onChange={(e) => setField(field, e.target.value)}
          disabled={submitting}
          className={isRate ? "pr-7" : undefined}
        />
        {isRate && (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
            %
          </span>
        )}
      </div>
      {errors[field] && (
        <p className="text-xs text-destructive">{errors[field]}</p>
      )}
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface LoanSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing loan to open in edit mode; omit for create mode. */
  loan?: LoanResponse
  onSaved: (result: LoanResponse) => void
  onDeleted?: (id: number) => void
}

export function LoanSheet({
  open,
  onOpenChange,
  loan,
  onSaved,
  onDeleted,
}: LoanSheetProps) {
  const isEdit = !!loan

  const [loanType, setLoanType] = React.useState<LoanType>("CONVENTIONAL")
  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Reset / populate form whenever the sheet opens or the target row changes
  React.useEffect(() => {
    if (!open) return
    if (loan) {
      setValues(toFormValues(loan))
      setLoanType(loan.loanType)
    } else {
      setValues(emptyValues)
      setLoanType("CONVENTIONAL")
    }
    setErrors({})
    setSubmitting(false)
  }, [open, loan])

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

    const body: LoanRequest = { loanType, ...result.data }

    setSubmitting(true)
    try {
      const saved = isEdit
        ? await apiRequest<LoanResponse>(`/api/loans/${loan!.id}`, {
            method: "PUT",
            body,
          })
        : await apiRequest<LoanResponse>("/api/loans", {
            method: "POST",
            body,
          })

      toast.success(
        isEdit ? "Loan updated successfully." : "Loan created successfully.",
      )
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to ${isEdit ? "update" : "create"} loan: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!loan) return
    setDeleting(true)
    try {
      await apiRequest(`/api/loans/${loan.id}`, { method: "DELETE" })
      toast.success("Loan deleted.")
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDeleted?.(loan.id)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to delete loan: ${message}`)
    } finally {
      setDeleting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const fp = { values, errors, submitting, setField }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col gap-0 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{isEdit ? "Edit Loan" : "New Loan"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the loan details below, then click Save Changes."
              : "Define a reusable loan product for deal analysis. Name and Type are required — all other fields are optional."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-4">

            {/* Core */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">
                Name{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. 30-yr Conventional"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                disabled={submitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="loanType">
                Type{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <Select
                value={loanType}
                onValueChange={(v) => setLoanType(v as LoanType)}
                disabled={submitting}
              >
                <SelectTrigger id="loanType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LOAN_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefault"
                checked={values.isDefault}
                onCheckedChange={(checked) =>
                  setField("isDefault", Boolean(checked))
                }
                disabled={submitting}
              />
              <Label htmlFor="isDefault">Set as default loan</Label>
            </div>

            <Separator />

            {/* Rates & Terms */}
            <SectionLabel>Rates &amp; Terms</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumInput {...fp} id="interestRate" label="Interest Rate" field="interestRate" />
              <NumInput {...fp} id="aprRate" label="APR Rate" field="aprRate" />
              <NumInput {...fp} id="downPaymentRate" label="Down Payment Rate" field="downPaymentRate" />
              <div className="flex flex-col gap-1">
                <Label htmlFor="years">Term (years)</Label>
                <Input
                  id="years"
                  type="text"
                  inputMode="numeric"
                  placeholder="—"
                  value={values.years}
                  onChange={(e) => setField("years", e.target.value)}
                  disabled={submitting}
                />
                {errors.years && (
                  <p className="text-xs text-destructive">{errors.years}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Fees */}
            <SectionLabel>Fees</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumInput {...fp} id="upfrontDiscounts" label="Upfront Discounts" field="upfrontDiscounts" />
              <NumInput {...fp} id="lenderFees" label="Lender Fees" field="lenderFees" />
              <div className="flex flex-col gap-1">
                <Label htmlFor="pmiAmountOverride">PMI (monthly $)</Label>
                <Input
                  id="pmiAmountOverride"
                  type="text"
                  inputMode="numeric"
                  placeholder="—"
                  value={values.pmiAmountOverride}
                  onChange={(e) => setField("pmiAmountOverride", e.target.value)}
                  disabled={submitting}
                />
                {errors.pmiAmountOverride && (
                  <p className="text-xs text-destructive">{errors.pmiAmountOverride}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* FHA */}
            <SectionLabel>FHA — Mortgage Insurance</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumInput {...fp} id="mipUpfrontRate" label="Upfront MIP Rate" field="mipUpfrontRate" />
              <NumInput {...fp} id="mipAnnualRate" label="Annual MIP Rate" field="mipAnnualRate" />
            </div>

            <Separator />

            {/* Hard Money */}
            <SectionLabel>Hard Money</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumInput {...fp} id="points" label="Origination Points" field="points" />
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
            <DialogTitle>Delete loan?</DialogTitle>
            <DialogDescription>
              &ldquo;{loan?.name}&rdquo; will be permanently deleted. This
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
