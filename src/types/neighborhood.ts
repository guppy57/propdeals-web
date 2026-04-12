export interface NeighborhoodRequest {
  name: string;
  nicheComMappedName?: string | null;
  letterGrade?: string | null;
  nicheComLetterGrade?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface NeighborhoodResponse extends NeighborhoodRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
}
