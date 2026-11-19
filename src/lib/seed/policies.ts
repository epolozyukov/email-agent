import type { PolicyDoc } from "../types";
// Fictional demo policies. Not real legal or compliance guidance.
const P = (id: string, title: string, owner: string, sections: [string, string][]): PolicyDoc => ({
  id, title, owner, version: "1.0", path: `/sites/Policies/${id}.docx`,
  sections: sections.map(([heading, text]) => ({ heading, text })),
});
export const policies: PolicyDoc[] = [
  P("POL-001", "Data Privacy and External Disclosure Policy", "Data Privacy Office", [
    ["1. Scope and principles", "This policy applies to all personal data about customers, employees and contacts. Personal data may only be disclosed to an external party where a documented lawful basis exists and the Data Privacy Office has approved the disclosure. Requests for customer information from external partners must never be fulfilled directly by business teams."],
    ["2. Disclosure and transfers", "Before disclosure, the requester must provide the purpose, the legal basis, the specific data fields needed and the recipient. Data should be minimised, and a data sharing agreement must be in place. Transfers outside the originating jurisdiction require a transfer assessment."],
    ["3. Timelines and urgency", "External deadlines do not override privacy review. The Data Privacy Office aims to respond to disclosure assessments within three working days. Business teams should tell requesters that disclosure is subject to review."],
    ["4. Data subject requests", "Requests from individuals about their data must be logged within one working day and passed to the Data Privacy Office, who track statutory response deadlines."],
    ["5. Suspected breaches", "Any suspected loss or unauthorised disclosure of personal data must be reported immediately to the Data Privacy Office, which decides on notification."],
  ]),
  P("POL-002", "Regulatory Inquiry Handling Procedure", "Regulatory Affairs", [
    ["1. Ownership and review", "All communication from regulators is logged and assigned to a Regulatory Affairs owner. Responses must be reviewed by Legal before submission and approved by the business unit head."],
    ["2. Deadlines", "The response deadline stated by the authority is recorded on receipt. Internal review milestones are set at 50% and 80% of the available time. Working days are counted from the date of receipt."],
    ["3. Document collection", "Regulatory Affairs agrees the document list with the requesting team. Where the request is unclear, a clarification is sent to the authority through Regulatory Affairs, never directly by the business team."],
    ["4. External communications", "No public or media statement about a regulatory matter may be issued without approval from Regulatory Affairs and Communications."],
  ]),
  P("POL-003", "Contract Review Guidelines", "Legal", [
    ["1. When legal review is required", "Any agreement above the approval threshold, or containing non-standard liability, data processing, indemnity or termination terms, requires Legal review before signature. No contract may be signed before review is complete."],
    ["2. Liability and indemnity", "Liability should be capped at the amount specified in the standard playbook. Uncapped liability and broad indemnities must be escalated to Legal Counsel."],
    ["3. Data processing terms", "Where a supplier processes personal data, a data processing agreement aligned with company standards is required. Changes to data processing clauses are reviewed by Legal with input from the Data Privacy Office."],
  ]),
  P("POL-004", "Sanctions Escalation Procedure", "Sanctions & Financial Crime", [
    ["1. Potential matches", "Any potential match against a sanctions list must be escalated to Sanctions & Financial Crime immediately. Related transactions and communications are paused until the match is cleared."],
    ["2. Screening cadence", "New counterparties are screened before onboarding and periodically thereafter. Screening results and decisions are recorded."],
  ]),
  P("POL-005", "Third-Party Due Diligence Policy", "Third-Party Risk", [
    ["1. Onboarding", "No new supplier, vendor or intermediary may be engaged before due diligence is completed and approved by Third-Party Risk. The depth of diligence depends on risk tier."],
    ["2. Enhanced due diligence", "Suppliers located in high-risk jurisdictions, or with complex ownership, require enhanced due diligence including ownership and sanctions checks."],
  ]),
  P("POL-006", "Confidential Information Handling Policy", "Legal", [
    ["1. Classification", "Company information is classified as Public, Internal, Confidential or Restricted. Confidential and Restricted information must not be shared externally without approval."],
    ["2. External requests", "Requests from external parties for internal documents, process descriptions or controls documentation must be referred to Legal. A non-disclosure agreement may be required before sharing."],
    ["3. Policy exceptions", "Exceptions to this or other policies require written approval from the policy owner and are recorded in the exceptions register."],
  ]),
  P("POL-007", "Anti-Bribery and Gifts Policy", "Sanctions & Financial Crime", [
    ["1. Gifts and hospitality", "Gifts above the stated value limit, or given to officials, require prior approval. Any suspicion of bribery or kickbacks must be reported to Financial Crime immediately."],
    ["2. Payments", "Changes to supplier bank details and unusual or urgent payment requests must be verified through an independent channel before payment."],
  ]),
  P("POL-008", "Records Retention and Legal Hold Procedure", "Legal", [
    ["1. Retention and holds", "Records are kept according to the retention schedule. When a legal hold is issued, deletion is suspended for the relevant records until Legal releases the hold."],
  ]),
  P("POL-009", "Licensing and Permits Management Procedure", "Regulatory Affairs", [
    ["1. Renewals", "Regulatory Affairs maintains the licence register and starts renewals at least 90 days before expiry."],
    ["2. Unlicensed activity", "If an activity may be taking place without a required licence, it must be reported to Regulatory Affairs and Legal immediately."],
  ]),
  P("POL-010", "Internal Investigations Procedure", "Sanctions & Financial Crime", [
    ["1. Reporting and handling", "Reports of suspected misconduct are handled confidentially and logged. The investigations team decides on scope, evidence preservation and who may be informed."],
  ]),
];
