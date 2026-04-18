import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { ApiError, apiRequest } from "@/lib/api"
import type {
  AssumptionSegment,
  AssumptionSetRequest,
  AssumptionSetResponse,
} from "@/types/assumption-set"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Zod schema ────────────────────────────────────────────────────────────────

function numField() {
  return z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().finite("Must be a valid number").optional().nullable(),
  )
}

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  isDefault: z.boolean().optional(),
  appreciationRate: numField(),
  closingCostsRate: numField(),
  federalTaxRate: numField(),
  stateTaxCode: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().nullable().optional(),
  ),
  landValuePrcnt: numField(),
  rentAppreciationRate: numField(),
  propertyTaxRate: numField(),
  homeInsuranceRate: numField(),
  vacancyRate: numField(),
  repairSavingsRate: numField(),
  capexReserveRate: numField(),
  discountRate: numField(),
  sellingCostsRate: numField(),
  longtermCapitalGainsTaxRate: numField(),
  residentialDepreciationPeriodYrs: numField(),
  defaultPropertyConditionScore: numField(),
  grossAnnualIncome: numField(),
  utilityElectricBase: numField(),
  utilityGasBase: numField(),
  utilityWaterBase: numField(),
  utilityTrashBase: numField(),
  utilityInternetBase: numField(),
  utilityBaselineSqft: numField(),
  mfAppreciationRateOverride: numField(),
  rehabContingencyPct: numField(),
  holdingCostRateMonthly: numField(),
  flipSellingCostsRate: numField(),
  shorttermCapitalGainsRate: numField(),
  minRoiPct: numField(),
  minProfitAmt: numField(),
})

// ─── Form state ────────────────────────────────────────────────────────────────

type StringField = Exclude<keyof FormValues, "description" | "isDefault">

type FormValues = {
  description: string
  isDefault: boolean
  appreciationRate: string
  closingCostsRate: string
  federalTaxRate: string
  stateTaxCode: string
  landValuePrcnt: string
  rentAppreciationRate: string
  propertyTaxRate: string
  homeInsuranceRate: string
  vacancyRate: string
  repairSavingsRate: string
  capexReserveRate: string
  discountRate: string
  sellingCostsRate: string
  longtermCapitalGainsTaxRate: string
  residentialDepreciationPeriodYrs: string
  defaultPropertyConditionScore: string
  grossAnnualIncome: string
  utilityElectricBase: string
  utilityGasBase: string
  utilityWaterBase: string
  utilityTrashBase: string
  utilityInternetBase: string
  utilityBaselineSqft: string
  mfAppreciationRateOverride: string
  rehabContingencyPct: string
  holdingCostRateMonthly: string
  flipSellingCostsRate: string
  shorttermCapitalGainsRate: string
  minRoiPct: string
  minProfitAmt: string
}

const emptyValues: FormValues = {
  description: "",
  isDefault: false,
  appreciationRate: "",
  closingCostsRate: "",
  federalTaxRate: "",
  stateTaxCode: "",
  landValuePrcnt: "",
  rentAppreciationRate: "",
  propertyTaxRate: "",
  homeInsuranceRate: "",
  vacancyRate: "",
  repairSavingsRate: "",
  capexReserveRate: "",
  discountRate: "",
  sellingCostsRate: "",
  longtermCapitalGainsTaxRate: "",
  residentialDepreciationPeriodYrs: "",
  defaultPropertyConditionScore: "",
  grossAnnualIncome: "",
  utilityElectricBase: "",
  utilityGasBase: "",
  utilityWaterBase: "",
  utilityTrashBase: "",
  utilityInternetBase: "",
  utilityBaselineSqft: "",
  mfAppreciationRateOverride: "",
  rehabContingencyPct: "",
  holdingCostRateMonthly: "",
  flipSellingCostsRate: "",
  shorttermCapitalGainsRate: "",
  minRoiPct: "",
  minProfitAmt: "",
}

function toFormValues(s: AssumptionSetResponse): FormValues {
  const n = (v: number | null | undefined) => (v == null ? "" : String(v))
  return {
    description: s.description,
    isDefault: s.isDefault,
    appreciationRate: n(s.appreciationRate),
    closingCostsRate: n(s.closingCostsRate),
    federalTaxRate: n(s.federalTaxRate),
    stateTaxCode: s.stateTaxCode ?? "",
    landValuePrcnt: n(s.landValuePrcnt),
    rentAppreciationRate: n(s.rentAppreciationRate),
    propertyTaxRate: n(s.propertyTaxRate),
    homeInsuranceRate: n(s.homeInsuranceRate),
    vacancyRate: n(s.vacancyRate),
    repairSavingsRate: n(s.repairSavingsRate),
    capexReserveRate: n(s.capexReserveRate),
    discountRate: n(s.discountRate),
    sellingCostsRate: n(s.sellingCostsRate),
    longtermCapitalGainsTaxRate: n(s.longtermCapitalGainsTaxRate),
    residentialDepreciationPeriodYrs: n(s.residentialDepreciationPeriodYrs),
    defaultPropertyConditionScore: n(s.defaultPropertyConditionScore),
    grossAnnualIncome: n(s.grossAnnualIncome),
    utilityElectricBase: n(s.utilityElectricBase),
    utilityGasBase: n(s.utilityGasBase),
    utilityWaterBase: n(s.utilityWaterBase),
    utilityTrashBase: n(s.utilityTrashBase),
    utilityInternetBase: n(s.utilityInternetBase),
    utilityBaselineSqft: n(s.utilityBaselineSqft),
    mfAppreciationRateOverride: n(s.mfAppreciationRateOverride),
    rehabContingencyPct: n(s.rehabContingencyPct),
    holdingCostRateMonthly: n(s.holdingCostRateMonthly),
    flipSellingCostsRate: n(s.flipSellingCostsRate),
    shorttermCapitalGainsRate: n(s.shorttermCapitalGainsRate),
    minRoiPct: n(s.minRoiPct),
    minProfitAmt: n(s.minProfitAmt),
  }
}

// ─── Shared sub-components (defined at module level to keep stable references) ──

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

export interface AssumptionSetSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing set to open in edit mode; omit for create mode. */
  assumptionSet?: AssumptionSetResponse
  onSaved: (result: AssumptionSetResponse) => void
  onDeleted?: (id: number) => void
}

export function AssumptionSetSheet({
  open,
  onOpenChange,
  assumptionSet,
  onSaved,
  onDeleted,
}: AssumptionSetSheetProps) {
  const isEdit = !!assumptionSet

  const [segment, setSegment] = React.useState<AssumptionSegment>("LTR")
  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Reset / populate form whenever the sheet opens or the target row changes
  React.useEffect(() => {
    if (!open) return
    if (assumptionSet) {
      setValues(toFormValues(assumptionSet))
      setSegment(assumptionSet.segment)
    } else {
      setValues(emptyValues)
      setSegment("LTR")
    }
    setErrors({})
    setSubmitting(false)
  }, [open, assumptionSet])

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

    const body: AssumptionSetRequest = { segment, ...result.data }

    setSubmitting(true)
    try {
      const saved = isEdit
        ? await apiRequest<AssumptionSetResponse>(
            `/api/assumption-sets/${assumptionSet!.id}`,
            { method: "PUT", body },
          )
        : await apiRequest<AssumptionSetResponse>("/api/assumption-sets", {
            method: "POST",
            body,
          })

      toast.success(
        isEdit
          ? "Assumption set updated successfully."
          : "Assumption set created successfully.",
      )
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(
        `Failed to ${isEdit ? "update" : "create"} assumption set: ${message}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!assumptionSet) return
    setDeleting(true)
    try {
      await apiRequest(`/api/assumption-sets/${assumptionSet.id}`, {
        method: "DELETE",
      })
      toast.success("Assumption set deleted.")
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDeleted?.(assumptionSet.id)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to delete assumption set: ${message}`)
    } finally {
      setDeleting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  // Shared props passed to every NumInput so they don't need to be repeated.
  const fp = { values, errors, submitting, setField }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col gap-0 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>
            {isEdit ? "Edit Assumption Set" : "New Assumption Set"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the assumptions below, then click Save Changes."
              : "Define reusable assumptions for deal analysis. Only Description is required — all other fields are optional."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-4">

            {/* Core */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="description"
                placeholder="e.g. Conservative LTR assumptions"
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
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
              <Label htmlFor="isDefault">Set as default for this segment</Label>
            </div>

            <Separator />

            {/* Shared fields */}
            <SectionLabel>Shared</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumInput {...fp} id="appreciationRate" label="Appreciation Rate" field="appreciationRate" />
              <NumInput {...fp} id="closingCostsRate" label="Closing Costs Rate" field="closingCostsRate" />
              <NumInput {...fp} id="federalTaxRate" label="Federal Tax Rate" field="federalTaxRate" />
              <NumInput {...fp} id="landValuePrcnt" label="Land Value %" field="landValuePrcnt" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="stateTaxCode">State Tax Code</Label>
              <Input
                id="stateTaxCode"
                placeholder="e.g. CA"
                value={values.stateTaxCode}
                onChange={(e) => setField("stateTaxCode", e.target.value)}
                disabled={submitting}
              />
            </div>

            <Separator />

            {/* Segment tabs */}
            <SectionLabel>Segment</SectionLabel>
            <Tabs
              value={segment}
              onValueChange={(v) => setSegment(v as AssumptionSegment)}
            >
              <TabsList className="w-full">
                <TabsTrigger
                  value="LTR"
                  className="flex-1"
                  disabled={submitting}
                >
                  Long-Term Rental
                </TabsTrigger>
                <TabsTrigger
                  value="FLIP"
                  className="flex-1"
                  disabled={submitting}
                >
                  Fix &amp; Flip
                </TabsTrigger>
              </TabsList>

              {/* ── LTR ── */}
              <TabsContent value="LTR" className="mt-5 flex flex-col gap-5">
                <SectionLabel>Rental Economics</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput {...fp} id="rentAppreciationRate" label="Rent Appreciation Rate" field="rentAppreciationRate" />
                  <NumInput {...fp} id="propertyTaxRate" label="Property Tax Rate" field="propertyTaxRate" />
                  <NumInput {...fp} id="homeInsuranceRate" label="Home Insurance Rate" field="homeInsuranceRate" />
                  <NumInput {...fp} id="vacancyRate" label="Vacancy Rate" field="vacancyRate" />
                  <NumInput {...fp} id="repairSavingsRate" label="Repair Savings Rate" field="repairSavingsRate" />
                  <NumInput {...fp} id="capexReserveRate" label="CapEx Reserve Rate" field="capexReserveRate" />
                </div>

                <SectionLabel>Financial</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput {...fp} id="discountRate" label="Discount Rate" field="discountRate" />
                  <NumInput {...fp} id="sellingCostsRate" label="Selling Costs Rate" field="sellingCostsRate" />
                  <NumInput {...fp} id="longtermCapitalGainsTaxRate" label="LT Capital Gains Rate" field="longtermCapitalGainsTaxRate" />
                  <NumInput {...fp} id="residentialDepreciationPeriodYrs" label="Depreciation Period (yrs)" field="residentialDepreciationPeriodYrs" />
                  <NumInput {...fp} id="defaultPropertyConditionScore" label="Property Condition Score" field="defaultPropertyConditionScore" />
                  <NumInput {...fp} id="grossAnnualIncome" label="Gross Annual Income" field="grossAnnualIncome" />
                  <NumInput {...fp} id="mfAppreciationRateOverride" label="MF Appreciation Override" field="mfAppreciationRateOverride" />
                </div>

                <SectionLabel>Utilities — Baseline</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput {...fp} id="utilityElectricBase" label="Electric" field="utilityElectricBase" />
                  <NumInput {...fp} id="utilityGasBase" label="Gas" field="utilityGasBase" />
                  <NumInput {...fp} id="utilityWaterBase" label="Water" field="utilityWaterBase" />
                  <NumInput {...fp} id="utilityTrashBase" label="Trash" field="utilityTrashBase" />
                  <NumInput {...fp} id="utilityInternetBase" label="Internet" field="utilityInternetBase" />
                  <NumInput {...fp} id="utilityBaselineSqft" label="Baseline Sqft" field="utilityBaselineSqft" />
                </div>
              </TabsContent>

              {/* ── FLIP ── */}
              <TabsContent value="FLIP" className="mt-5 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <NumInput {...fp} id="rehabContingencyPct" label="Rehab Contingency %" field="rehabContingencyPct" />
                  <NumInput {...fp} id="holdingCostRateMonthly" label="Holding Cost Rate (mo.)" field="holdingCostRateMonthly" />
                  <NumInput {...fp} id="flipSellingCostsRate" label="Selling Costs Rate" field="flipSellingCostsRate" />
                  <NumInput {...fp} id="shorttermCapitalGainsRate" label="ST Capital Gains Rate" field="shorttermCapitalGainsRate" />
                  <NumInput {...fp} id="minRoiPct" label="Min ROI %" field="minRoiPct" />
                  <NumInput {...fp} id="minProfitAmt" label="Min Profit Amount" field="minProfitAmt" />
                </div>
              </TabsContent>
            </Tabs>

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
            <DialogTitle>Delete assumption set?</DialogTitle>
            <DialogDescription>
              &ldquo;{assumptionSet?.description}&rdquo; will be permanently
              deleted. This action cannot be undone.
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
