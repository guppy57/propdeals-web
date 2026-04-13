export interface ResearchTypeRequest {
  researchType: string;
  prompt: string;
}

export interface ResearchTypeResponse extends ResearchTypeRequest {
  id: string; // UUID
  createdAt: string;
  updatedAt: string;
}
