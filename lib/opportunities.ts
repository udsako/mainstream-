export type OpportunityCategory = "Tryout" | "Tournament" | "Sponsorship" | "Volunteer";

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  venue: string;
  description: string;
  deadline: string; // ISO date string, e.g. "2026-08-15"
  /** If true, this posting stays visible after its deadline passes (marked Closed) instead of being hidden. */
  keepVisibleAfterDeadline?: boolean;
}

export function isOpen(opportunity: Opportunity): boolean {
  return new Date(opportunity.deadline).getTime() >= Date.now();
}
