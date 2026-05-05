export type AssumptionSegment = 'LTR' | 'FLIP';

/**
 * Matches AssumptionSetRequest.java.
 * `segment` and `description` are required; all other fields are optional/nullable.
 */
export interface AssumptionSetRequest {
  segment: AssumptionSegment;
  description: string;
  isDefault?: boolean | null;

  // ── Shared ──────────────────────────────────────────────────────────────
  appreciationRate?: number | null;
  closingCostsRate?: number | null;
  federalTaxRate?: number | null;
  stateTaxCode?: string | null;
  landValuePrcnt?: number | null;

  // Closing cost line item defaults
  brokerFees?: number | null;
  homeInspectionSfhFee?: number | null;
  homeInspectionMfBaseFee?: number | null;
  homeInspectionMfPerUnitFee?: number | null;
  propertySurveyFee?: number | null;
  pestInspectionFee?: number | null;
  structuralEngineeringFee?: number | null;
  sewerScopeFee?: number | null;

  // ── LTR-only ────────────────────────────────────────────────────────────
  rentAppreciationRate?: number | null;
  propertyTaxRate?: number | null;
  homeInsuranceRate?: number | null;
  vacancyRate?: number | null;
  repairSavingsRate?: number | null;
  capexReserveRate?: number | null;
  discountRate?: number | null;
  sellingCostsRate?: number | null;
  longtermCapitalGainsTaxRate?: number | null;
  residentialDepreciationPeriodYrs?: number | null;
  defaultPropertyConditionScore?: number | null;
  grossAnnualIncome?: number | null;
  utilityElectricBase?: number | null;
  utilityGasBase?: number | null;
  utilityWaterBase?: number | null;
  utilityTrashBase?: number | null;
  utilityInternetBase?: number | null;
  utilityBaselineSqft?: number | null;
  mfAppreciationRateOverride?: number | null;
  qeSfhMultiplier?: number | null;
  qeMfMultiplier?: number | null;

  // ── FLIP-only ────────────────────────────────────────────────────────────
  rehabContingencyPct?: number | null;
  holdingCostRateMonthly?: number | null;
  flipSellingCostsRate?: number | null;
  shorttermCapitalGainsRate?: number | null;
  minRoiPct?: number | null;
  minProfitAmt?: number | null;
}

/**
 * Matches AssumptionSetResponse.java.
 * Extends the request shape with server-assigned fields; `isDefault` is always present.
 */
export interface AssumptionSetResponse extends AssumptionSetRequest {
  id: number;
  isDefault: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
