import { jsPDF } from "jspdf";
import type { EmergencyContact } from "@/components/app/contacts";
import type { EmergencyPlan } from "@/components/app/emergency-plan";
import type { MedicalNote, MedicalProfile } from "@/components/app/medical";
import { supplyIssues, type SupplyItem } from "@/components/app/supplies";

export const PLAN_EXPORT_SECTIONS = ["contacts", "plan", "medical", "supplies", "readiness", "documents", "medicalNotes"] as const;
export type PlanExportSection = (typeof PLAN_EXPORT_SECTIONS)[number];
export type PlanExportAction = "download" | "print";

export const DEFAULT_PLAN_EXPORT_SECTIONS: PlanExportSection[] = ["contacts", "plan", "medical", "supplies", "readiness"];

type PdfCopy = {
  title: string;
  generated: string;
  notRecorded: string;
  disclaimer: string;
  sections: { contacts: string; emergencyPlan: string; medical: string; medicalNotes: string; supplies: string; readiness: string; documents: string };
  fields: {
    primaryMeetingPlace: string; backupMeetingPlace: string; familyRoles: string; documentsLocation: string; communicationPlan: string;
    name: string; relationship: string; phone: string; alternatePhone: string; location: string; primaryContact: string; yes: string; no: string;
    bloodType: string; allergies: string; chronicDiseases: string; medications: string;
    quantity: string; category: string; expiresOn: string; status: string; readiness: string; noteTitle: string; noteCategory: string; noteContent: string;
  };
  supplyStatus: { ready: string; restock: string; expiresSoon: string; expired: string };
};

type ExportPlanPdfInput = {
  action: PlanExportAction;
  contacts: EmergencyContact[];
  copy: PdfCopy;
  emergencyPlan: EmergencyPlan;
  locale: string;
  medicalProfiles: MedicalProfile[];
  medicalNotes: MedicalNote[];
  readiness: { complete: number; total: number };
  sections: PlanExportSection[];
  supplies: SupplyItem[];
};

function dateValue(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(locale).format(parsed);
}

function supplyStatus(item: SupplyItem, copy: PdfCopy) {
  const issues = supplyIssues(item);
  if (issues.includes("expired")) return copy.supplyStatus.expired;
  if (issues.includes("expires-soon")) return copy.supplyStatus.expiresSoon;
  if (issues.includes("restock")) return copy.supplyStatus.restock;
  return copy.supplyStatus.ready;
}

function printPdf(pdf: jsPDF) {
  const iframe = window.document.createElement("iframe");
  const url = URL.createObjectURL(pdf.output("blob"));
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "border:0;height:0;left:-9999px;position:fixed;width:0;";
  iframe.src = url;
  const removeIframe = () => {
    URL.revokeObjectURL(url);
    iframe.remove();
  };
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(removeIframe, 60_000);
  };
  window.document.body.append(iframe);
}

export function exportPlanPdf({ action, contacts, copy, emergencyPlan, locale, medicalNotes, medicalProfiles, readiness, sections, supplies }: ExportPlanPdfInput) {
  const included = new Set(sections);
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  const ensureSpace = (height: number) => {
    if (cursorY + height <= pageHeight - margin) return;
    pdf.addPage();
    cursorY = margin;
  };
  const addParagraph = (text: string, size = 10, spacing = 5) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, contentWidth) as string[];
    ensureSpace((lines.length * spacing) + 3);
    pdf.text(lines, margin, cursorY);
    cursorY += (lines.length * spacing) + 3;
  };
  const addHeading = (text: string) => {
    ensureSpace(12);
    cursorY += 3;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(text, margin, cursorY);
    cursorY += 7;
  };
  const addField = (label: string, value: string | number | null | undefined) => {
    const displayedValue = String(value ?? "").trim() || copy.notRecorded;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    const labelLines = pdf.splitTextToSize(`${label}:`, contentWidth) as string[];
    pdf.setFont("helvetica", "normal");
    const valueLines = pdf.splitTextToSize(displayedValue, contentWidth) as string[];
    ensureSpace(((labelLines.length + valueLines.length) * 5) + 3);
    pdf.setFont("helvetica", "bold");
    pdf.text(labelLines, margin, cursorY);
    cursorY += labelLines.length * 5;
    pdf.setFont("helvetica", "normal");
    pdf.text(valueLines, margin, cursorY);
    cursorY += (valueLines.length * 5) + 3;
  };

  pdf.setProperties({ subject: copy.title, title: copy.title });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(copy.title, margin, cursorY);
  cursorY += 9;
  addParagraph(copy.generated.replace("{date}", new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date())), 9, 4);
  addParagraph(copy.disclaimer, 9, 4);

  if (included.has("plan")) {
    addHeading(copy.sections.emergencyPlan);
    addField(copy.fields.primaryMeetingPlace, emergencyPlan.primaryMeetingPlace);
    addField(copy.fields.backupMeetingPlace, emergencyPlan.backupMeetingPlace);
    addField(copy.fields.familyRoles, emergencyPlan.familyRoles);
    addField(copy.fields.communicationPlan, emergencyPlan.communicationPlan);
  }
  if (included.has("documents")) {
    addHeading(copy.sections.documents);
    addField(copy.fields.documentsLocation, emergencyPlan.documentsLocation);
  }
  if (included.has("contacts")) {
    addHeading(copy.sections.contacts);
    if (contacts.length === 0) addParagraph(copy.notRecorded);
    contacts.forEach((contact) => {
      addField(copy.fields.name, contact.name);
      addField(copy.fields.relationship, contact.relationship);
      addField(copy.fields.phone, contact.phone);
      addField(copy.fields.alternatePhone, contact.altPhone);
      addField(copy.fields.location, contact.location);
      addField(copy.fields.primaryContact, contact.isPrimary ? copy.fields.yes : copy.fields.no);
    });
  }
  if (included.has("medical")) {
    addHeading(copy.sections.medical);
    if (medicalProfiles.length === 0) addParagraph(copy.notRecorded);
    medicalProfiles.forEach((profile) => {
      addField(copy.fields.name, profile.fullName);
      addField(copy.fields.relationship, profile.relationship);
      addField(copy.fields.bloodType, profile.bloodType);
      addField(copy.fields.allergies, profile.allergies);
      addField(copy.fields.chronicDiseases, profile.chronicDiseases);
      addField(copy.fields.medications, profile.medications);
    });
  }
  if (included.has("medicalNotes")) {
    addHeading(copy.sections.medicalNotes);
    if (medicalNotes.length === 0) addParagraph(copy.notRecorded);
    medicalNotes.forEach((note) => {
      addField(copy.fields.name, medicalProfiles.find((profile) => profile.id === note.memberId)?.fullName ?? note.memberId);
      addField(copy.fields.noteTitle, note.title);
      addField(copy.fields.noteCategory, note.category);
      addField(copy.fields.noteContent, note.content);
    });
  }
  if (included.has("supplies")) {
    addHeading(copy.sections.supplies);
    if (supplies.length === 0) addParagraph(copy.notRecorded);
    supplies.forEach((supply) => {
      addField(copy.fields.name, supply.name);
      addField(copy.fields.category, supply.category);
      addField(copy.fields.quantity, `${supply.onHand} / ${supply.target} ${supply.unit}`);
      addField(copy.fields.expiresOn, dateValue(supply.expiresOn, locale, copy.notRecorded));
      addField(copy.fields.status, supplyStatus(supply, copy));
    });
  }
  if (included.has("readiness")) {
    addHeading(copy.sections.readiness);
    addField(copy.fields.readiness, `${readiness.complete} / ${readiness.total}`);
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }
  if (action === "print") printPdf(pdf);
  else pdf.save("plan0-emergency-plan.pdf");
}
