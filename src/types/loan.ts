export type LoanType =
  | 'CONVENTIONAL'
  | 'FHA'
  | 'DSCR'
  | 'SBA_7A'
  | 'HARD_MONEY'
  | 'SELLER_FINANCE'
  | 'CASH';

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  CONVENTIONAL: 'Conventional',
  FHA: 'FHA',
  DSCR: 'DSCR',
  SBA_7A: 'SBA 7(a)',
  HARD_MONEY: 'Hard Money',
  SELLER_FINANCE: 'Seller Finance',
  CASH: 'Cash',
};

/**
 * Matches LoanRequest.java.
 * `name` and `loanType` are required; all other fields are optional/nullable.
 */
export interface LoanRequest {
  name: string;
  loanType: LoanType;
  isDefault?: boolean | null;

  interestRate?: number | null;
  aprRate?: number | null;
  downPaymentRate?: number | null;
  years?: number | null;

  // ── FHA-only ────────────────────────────────────────────────────────────
  mipUpfrontRate?: number | null;
  mipAnnualRate?: number | null;

  upfrontDiscounts?: number | null;
  lenderFees?: number | null;
  pmiAmountOverride?: number | null;

  // ── Hard money ──────────────────────────────────────────────────────────
  points?: number | null;
}

/**
 * Matches LoanResponse.java.
 * Extends the request shape with server-assigned fields; `isDefault` is always present.
 */
export interface LoanResponse extends LoanRequest {
  id: number;
  isDefault: boolean;
  createdAt: string; // ISO 8601
}
