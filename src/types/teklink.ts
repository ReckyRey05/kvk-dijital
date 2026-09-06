export type TekLinkFieldType =
  | "text"
  | "textarea"
  | "phone"
  | "email"
  | "date"
  | "select"
  | "checkbox"
  | "file";

export interface TekLinkField {
  id: string;
  type: TekLinkFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select dropdown or checkbox list
}

export interface TekLinkForm {
  id: string;
  tenantId: string; // Firebase Auth UID of business
  slug: string; // Unique public short link (e.g. "abc123")
  title: string; // E.g. "Yeni Müşteri Formu"
  description?: string;
  businessName: string; // E.g. "Kaya Otomotiv"
  logoUrl?: string;
  fields: TekLinkField[];
  isActive: boolean;
  responseCount: number;
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
}

export interface TekLinkSubmissionFile {
  fieldId: string;
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
}

export interface TekLinkSubmission {
  id: string;
  formId: string;
  tenantId: string;
  formTitle: string;
  answers: Record<string, any>; // fieldId -> value (string | string[] | boolean)
  files?: TekLinkSubmissionFile[];
  senderSummary: string; // Extracted name/email/phone for quick table display
  createdAt: number; // Unix timestamp ms
}

export interface TekLinkTenantProfile {
  id: string; // Firebase Auth UID
  businessName: string;
  email: string;
  phone?: string;
  createdAt: number;
}

// Public form payload returned to customer (zero private tenant metadata)
export interface TekLinkPublicForm {
  slug: string;
  title: string;
  description?: string;
  businessName: string;
  logoUrl?: string;
  fields: TekLinkField[];
}
