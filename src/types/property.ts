export type PropertyStatus =
  | 'ACTIVE'
  | 'ACCEPTED'
  | 'PASSED'
  | 'SOLD'
  | 'PENDING_SALE'
  | 'OFF_MARKET'

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  ACTIVE: 'Active',
  ACCEPTED: 'Accepted',
  PASSED: 'Passed',
  SOLD: 'Sold',
  PENDING_SALE: 'Pending Sale',
  OFF_MARKET: 'Off Market',
}

export type SellerCircumstance =
  | 'DIVORCE'
  | 'ESTATE_SALE'
  | 'FORECLOSURE'
  | 'RELOCATION'
  | 'FINANCIAL_DISTRESS'
  | 'TIRED_LANDLORD'
  | 'UNKNOWN'

export interface PropertyRequest {
  address1: string
  fullAddress?: string | null
  city?: string | null
  zipCode?: string | null
  state?: string | null
  country?: string | null
  zillowLink?: string | null
  purchasePrice?: number | null
  beds?: number | null
  baths?: number | null
  squareFt?: number | null
  builtIn?: number | null
  units?: number | null
  walkScore?: number | null
  transitScore?: number | null
  bikeScore?: number | null
  lat?: number | null
  lon?: number | null
  annualElectricityCostEst?: number | null
  status?: PropertyStatus | null
  listedDate?: string | null
  hasTenants?: boolean | null
  hasReducedPrice?: boolean | null
  county?: string | null
  annualTaxAmount?: number | null
  rentDdCompleted?: boolean | null
  gasStationDistanceMiles?: number | null
  schoolDistanceMiles?: number | null
  universityDistanceMiles?: number | null
  groceryStoreDistanceMiles?: number | null
  hospitalDistanceMiles?: number | null
  parkDistanceMiles?: number | null
  transitStationDistanceMiles?: number | null
  gasStationCount5mi?: number | null
  schoolCount5mi?: number | null
  universityCount5mi?: number | null
  groceryStoreCount5mi?: number | null
  hospitalCount5mi?: number | null
  parkCount5mi?: number | null
  transitStationCount5mi?: number | null
  sellerCircumstances?: SellerCircumstance | null
  obtainedCountyRecords?: boolean | null
  historicalTurnoverRate?: number | null
  hasDeedRestrictions?: boolean | null
  hasHao?: boolean | null
  hasHistoricPreservation?: boolean | null
  setbacks?: string | null
  hasEasements?: boolean | null
  easements?: string | null
  inFloodZone?: boolean | null
  hasOpenPulledPermits?: boolean | null
  hasWorkDoneWoPermits?: boolean | null
  lastPurchasePrice?: number | null
  lastPurchaseDate?: string | null
  countyRecordNotes?: string | null
  propertyNotes?: string | null
  whitepagesNotes?: string | null
  rentEstimate?: number | null
  rentEstimateLow?: number | null
  rentEstimateHigh?: number | null
  isFsbo?: boolean | null
  averageOwnershipDuration?: number | null
  estPrice?: number | null
  estPriceLow?: number | null
  estPriceHigh?: number | null
  hasMarketResearch?: boolean | null
  propertyConditionScore?: number | null
  reasonForPassing?: string | null
}

export interface PropertyResponse extends PropertyRequest {
  id: string
  createdAt: string
  updatedAt: string
}
