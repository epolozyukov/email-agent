import type { DirectoryUser, Specialist } from "../types";
const U = (id: string, displayName: string, mail: string, department: string, jobTitle: string, managerId: string | null, officeLocation: string, expertise: string[]): DirectoryUser =>
  ({ id, displayName, mail, department, jobTitle, managerId, officeLocation, expertise });
// Fictional users. Shape mirrors Microsoft Graph's `user` resource.
export const directoryUsers: DirectoryUser[] = [
  U("U001", "Elena Vasquez", "elena.vasquez@business.com", "Executive Office", "Chief Operating Officer", null, "London", ["strategy"]),
  U("U002", "Marcus Hale", "marcus.hale@business.com", "Procurement", "Head of Procurement", "U001", "London", ["sourcing", "supplier management"]),
  U("U003", "John Smith", "john.smith@business.com", "Procurement", "Senior Procurement Manager", "U002", "London", ["contracts", "supplier onboarding"]),
  U("U004", "Sarah Jones", "sarah.jones@business.com", "Operations", "Operations Manager", "U005", "Manchester", ["operational controls", "process"]),
  U("U005", "David Okafor", "david.okafor@business.com", "Operations", "Director of Operations", "U001", "London", ["operations"]),
  U("U006", "Michael Brown", "michael.brown@business.com", "Commercial", "Commercial Manager", "U007", "Dublin", ["supplier agreements", "negotiation"]),
  U("U007", "Aisha Rahman", "aisha.rahman@business.com", "Commercial", "Head of Commercial", "U001", "London", ["commercial"]),
  U("U008", "Priya Nair", "priya.nair@business.com", "Data Privacy Office", "Data Privacy Specialist", "U009", "Dublin", ["GDPR", "data sharing", "DPIA"]),
  U("U009", "Tomas Lindqvist", "tomas.lindqvist@business.com", "Data Privacy Office", "Data Protection Officer", "U001", "Stockholm", ["GDPR", "breach response"]),
  U("U010", "Helen Carter", "helen.carter@business.com", "Regulatory Affairs", "Regulatory Affairs Specialist", "U011", "London", ["regulatory inquiries", "licensing", "policy"]),
  U("U011", "Robert Kim", "robert.kim@business.com", "Regulatory Affairs", "Head of Regulatory Affairs", "U001", "London", ["regulators"]),
  U("U012", "Laura Bianchi", "laura.bianchi@business.com", "Legal", "Legal Counsel", "U013", "Milan", ["contracts", "liability", "data processing terms"]),
  U("U013", "James Whitfield", "james.whitfield@business.com", "Legal", "General Counsel", "U001", "London", ["corporate law"]),
  U("U014", "Nadia Petrov", "nadia.petrov@business.com", "Compliance", "Sanctions & Financial Crime Specialist", "U013", "London", ["sanctions", "AML", "investigations"]),
  U("U015", "Omar Haddad", "omar.haddad@business.com", "Risk", "Third-Party Risk Specialist", "U013", "Dubai", ["due diligence", "vendor risk"]),
];
export const specialists: Specialist[] = [
  { id: "SP-01", name: "Priya Nair", title: "Data Privacy Specialist", team: "Data Privacy Office", email: "priya.nair@business.com", categories: ["Data Privacy"], expertise: ["gdpr", "data sharing", "disclosure", "personal data", "dpia"], escalationContact: "tomas.lindqvist@business.com" },
  { id: "SP-02", name: "Helen Carter", title: "Regulatory Affairs Specialist", team: "Regulatory Affairs", email: "helen.carter@business.com", categories: ["Regulatory Inquiry", "Licensing", "Internal Policy Clarification"], expertise: ["regulator", "inquiry", "licence", "policy", "documentation"], escalationContact: "robert.kim@business.com" },
  { id: "SP-03", name: "Laura Bianchi", title: "Legal Counsel", team: "Legal", email: "laura.bianchi@business.com", categories: ["Contract Review"], expertise: ["contract", "liability", "clause", "indemnity", "agreement"], escalationContact: "james.whitfield@business.com" },
  { id: "SP-04", name: "Nadia Petrov", title: "Sanctions & Financial Crime Specialist", team: "Sanctions & Financial Crime", email: "nadia.petrov@business.com", categories: ["Sanctions Screening", "Financial Crime", "Compliance Investigation"], expertise: ["sanctions", "aml", "fraud", "investigation", "bribery"], escalationContact: "james.whitfield@business.com" },
  { id: "SP-05", name: "Omar Haddad", title: "Third-Party Risk Specialist", team: "Third-Party Risk", email: "omar.haddad@business.com", categories: ["Third-Party Risk"], expertise: ["supplier", "vendor", "due diligence", "onboarding"], escalationContact: "james.whitfield@business.com" },
];
export const TRIAGE_QUEUE = { team: "General Triage", email: "compliance.triage@business.com", name: "Compliance Triage Queue" };
