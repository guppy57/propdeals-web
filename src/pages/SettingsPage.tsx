import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { ApiError, apiRequest } from "@/lib/api"
import type {
  HouseHackingUnitPreference,
  UserSettingsRequest,
  UserSettingsResponse,
} from "@/types/user-settings"
import { HOUSE_HACKING_UNIT_PREFERENCE_LABELS } from "@/types/user-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const UNIT_PREFERENCES: HouseHackingUnitPreference[] = [
  "LEAST_RENT",
  "SMALLEST_SIZE",
  "MOST_RENT",
  "BIGGEST_SIZE",
]

const formSchema = z.object({
  emergencyFundMonthlyAmount: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int("Must be a whole number").positive("Must be a positive number"),
  ),
  emergencyFundMonths: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int("Must be a whole number").positive("Must be a positive number"),
  ),
})

type FormValues = {
  emergencyFundMonthlyAmount: string
  emergencyFundMonths: string
}

function toFormValues(s: UserSettingsResponse): FormValues {
  return {
    emergencyFundMonthlyAmount: String(s.emergencyFundMonthlyAmount),
    emergencyFundMonths: String(s.emergencyFundMonths),
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function SettingsPage() {
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const [values, setValues] = React.useState<FormValues>({
    emergencyFundMonthlyAmount: "1500",
    emergencyFundMonths: "3",
  })
  const [unitPref, setUnitPref] = React.useState<HouseHackingUnitPreference>("LEAST_RENT")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    apiRequest<UserSettingsResponse>("/api/user-settings/me")
      .then((data) => {
        setValues(toFormValues(data))
        setUnitPref(data.houseHackingUnitPreference)
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load settings.")
      })
      .finally(() => setLoading(false))
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = formSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    const body: UserSettingsRequest = {
      ...result.data,
      houseHackingUnitPreference: unitPref,
    }

    setSubmitting(true)
    try {
      const saved = await apiRequest<UserSettingsResponse>("/api/user-settings/me", {
        method: "PUT",
        body,
      })
      setValues(toFormValues(saved))
      setUnitPref(saved.houseHackingUnitPreference)
      toast.success("Settings saved.")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(`Failed to save settings: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin mr-2" />
        Loading settings…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="px-4 py-6 lg:px-6">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-6">
      <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-6">

        {/* Emergency Fund */}
        <div className="flex flex-col gap-4">
          <SectionLabel>Emergency Fund</SectionLabel>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="emergencyFundMonthlyAmount">Monthly Amount ($)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  id="emergencyFundMonthlyAmount"
                  type="text"
                  inputMode="numeric"
                  placeholder="1500"
                  value={values.emergencyFundMonthlyAmount}
                  onChange={(e) => setField("emergencyFundMonthlyAmount", e.target.value)}
                  disabled={submitting}
                  className="pl-6"
                />
              </div>
              {errors.emergencyFundMonthlyAmount && (
                <p className="text-xs text-destructive">{errors.emergencyFundMonthlyAmount}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="emergencyFundMonths">Months of Reserve</Label>
              <Input
                id="emergencyFundMonths"
                type="text"
                inputMode="numeric"
                placeholder="3"
                value={values.emergencyFundMonths}
                onChange={(e) => setField("emergencyFundMonths", e.target.value)}
                disabled={submitting}
              />
              {errors.emergencyFundMonths && (
                <p className="text-xs text-destructive">{errors.emergencyFundMonths}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* House Hacking */}
        <div className="flex flex-col gap-4">
          <SectionLabel>House Hacking</SectionLabel>

          <div className="flex flex-col gap-1">
            <Label htmlFor="houseHackingUnitPreference">Live-in Unit Selection</Label>
            <Select
              value={unitPref}
              onValueChange={(v) => setUnitPref(v as HouseHackingUnitPreference)}
              disabled={submitting}
            >
              <SelectTrigger id="houseHackingUnitPreference" className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_PREFERENCES.map((pref) => (
                  <SelectItem key={pref} value={pref}>
                    {HOUSE_HACKING_UNIT_PREFERENCE_LABELS[pref]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When house hacking, determines which unit the calculator assumes you will live in.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2Icon className="size-3 animate-spin mr-1" aria-hidden />}
            {submitting ? "Saving…" : "Save Settings"}
          </Button>
        </div>

      </form>
    </div>
  )
}
