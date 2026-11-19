import type { DirectoryUser, EmailInput, PolicyDoc, RetrievedSource, Specialist, SourceType } from "@/lib/types";

export interface EmailService {
  /** Simulates mailbox intake and stores metadata. */
  receive(email: EmailInput): { messageId: string; receivedAt: string };
  /** Simulates sending. NEVER sends a real email in the MVP. */
  simulateSend(draft: { to: string; subject: string; body: string }): { messageId: string; sentAt: string; simulated: true };
}
export interface DirectoryService {
  findByEmail(mail: string): DirectoryUser | null;
  getManager(user: DirectoryUser): DirectoryUser | null;
  getManagerChain(user: DirectoryUser, depth?: number): DirectoryUser[];
}
export interface SharePointService {
  listDocuments(): PolicyDoc[];
}
export interface SpecialistService {
  list(): Specialist[];
  findForCategory(category: string): Specialist[];
}
export interface KnowledgeBaseService {
  readonly retrievalMode: RetrievedSource["retrievalMode"];
  search(type: SourceType, query: string, k: number): RetrievedSource[];
  getById(sourceId: string): RetrievedSource | null;
}
export interface IntegrationStatus { name: string; status: string; simulated: boolean }
