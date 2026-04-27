export type HouseHackingUnitPreference =
  | 'LEAST_RENT'
  | 'SMALLEST_SIZE'
  | 'MOST_RENT'
  | 'BIGGEST_SIZE';

export const HOUSE_HACKING_UNIT_PREFERENCE_LABELS: Record<HouseHackingUnitPreference, string> = {
  LEAST_RENT:    'Least Rent (cheapest unit)',
  SMALLEST_SIZE: 'Smallest Size',
  MOST_RENT:     'Most Rent (highest-rent unit)',
  BIGGEST_SIZE:  'Biggest Size',
};

export interface UserSettingsRequest {
  emergencyFundMonthlyAmount: number;
  emergencyFundMonths: number;
  houseHackingUnitPreference: HouseHackingUnitPreference;
}

export interface UserSettingsResponse {
  emergencyFundMonthlyAmount: number;
  emergencyFundMonths: number;
  houseHackingUnitPreference: HouseHackingUnitPreference;
}
