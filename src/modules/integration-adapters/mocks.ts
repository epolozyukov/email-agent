import { randomUUID } from "node:crypto";
import type { DirectoryService, EmailService, SharePointService, SpecialistService } from "./interfaces";
import type { EmailInput } from "@/lib/types";
import { directoryUsers, specialists } from "@/lib/seed/directory";
import { policies } from "@/lib/seed/policies";

export class MockEmailService implements EmailService {
  receive(_email: EmailInput) { return { messageId: `<${randomUUID()}@mock.exchange>`, receivedAt: new Date().toISOString() }; }
  simulateSend(_draft: { to: string; subject: string; body: string }) { return { messageId: `<${randomUUID()}@mock.exchange>`, sentAt: new Date().toISOString(), simulated: true as const }; }
}
export class MockDirectoryService implements DirectoryService {
  findByEmail(mail: string) { return directoryUsers.find((u) => u.mail.toLowerCase() === mail.trim().toLowerCase()) ?? null; }
  getManager(user: { managerId: string | null }) { return user.managerId ? directoryUsers.find((u) => u.id === user.managerId) ?? null : null; }
  getManagerChain(user: Parameters<DirectoryService["getManager"]>[0], depth = 2) {
    const chain = []; let cur = this.getManager(user);
    while (cur && chain.length < depth) { chain.push(cur); cur = this.getManager(cur); }
    return chain;
  }
}
export class MockSharePointService implements SharePointService { listDocuments() { return policies; } }
export class MockSpecialistService implements SpecialistService {
  list() { return specialists; }
  findForCategory(category: string) { return specialists.filter((s) => s.categories.includes(category)); }
}
