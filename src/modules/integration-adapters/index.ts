import { MockDirectoryService, MockEmailService, MockSharePointService, MockSpecialistService } from "./mocks";
import { Bm25KnowledgeBase } from "../rag-service";
import type { IntegrationStatus } from "./interfaces";

/** Single swap point: replace mocks with Graph/SharePoint adapters here. */
const g = globalThis as unknown as { __integrations?: ReturnType<typeof build> };
function build() {
  const sharePoint = new MockSharePointService();
  return { email: new MockEmailService(), directory: new MockDirectoryService(), sharePoint, specialists: new MockSpecialistService(), kb: new Bm25KnowledgeBase(sharePoint) };
}
export const integrations = (g.__integrations ??= build());

export function integrationStatuses(): IntegrationStatus[] {
  return [
    { name: "Outlook / Exchange", status: "Mock Connected", simulated: true },
    { name: "Org Directory (Microsoft Entra ID)", status: "Mock Connected", simulated: true },
    { name: "SharePoint", status: "Mock Connected", simulated: true },
    { name: "Specialist Directory", status: "Mock Connected", simulated: true },
  ];
}
