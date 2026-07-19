export type OpportunityCategory = "Tryout" | "Tournament" | "Sponsorship" | "Volunteer";

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  venue: string;
  ticketLink?: string;
  description: string;
  deadline: string; // ISO date string, e.g. "2026-08-15"
  keepVisibleAfterDeadline?: boolean;
  /**
   * Optional list of sub-events bundled under this one posting —
   * e.g. ["Draft Combine", "Draft Night", "Championship Games", "Award Ceremony"].
   * One registration on this opportunity covers everything listed here.
   * Leave empty/undefined for a standalone single-event posting.
   */
  subEvents?: string[];
}

export function isOpen(opportunity: Opportunity): boolean {
  return new Date(opportunity.deadline).getTime() >= Date.now();
}