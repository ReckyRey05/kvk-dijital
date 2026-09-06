import { getAdminDb } from "@/lib/firebase/admin";
import { TekLinkForm, TekLinkSubmission, TekLinkPublicForm, TekLinkTenantProfile } from "@/types/teklink";

// Generate a random 6-character clean slug (letters and numbers, lowercase, non-confusing)
export function generateSlug(length: number = 6): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ensure database connection safely
function getDb() {
  return getAdminDb();
}

/**
 * Get or create tenant profile for business
 */
export async function getOrCreateTenant(uid: string, email: string, businessName?: string): Promise<TekLinkTenantProfile> {
  const db = getDb();
  const tenantRef = db.collection("teklink_tenants").doc(uid);
  const snap = await tenantRef.get();

  if (snap.exists) {
    return snap.data() as TekLinkTenantProfile;
  }

  const newProfile: TekLinkTenantProfile = {
    id: uid,
    businessName: businessName?.trim() || email.split("@")[0] || "İşletmem",
    email,
    createdAt: Date.now(),
  };

  await tenantRef.set(newProfile);
  return newProfile;
}

/**
 * Get all forms for a specific tenant (strictly isolated)
 */
export async function getTenantForms(tenantId: string): Promise<TekLinkForm[]> {
  const db = getDb();
  const snap = await db
    .collection("teklink_forms")
    .where("tenantId", "==", tenantId)
    .get();

  const forms: TekLinkForm[] = [];
  snap.forEach((doc) => {
    forms.push({ id: doc.id, ...(doc.data() as Omit<TekLinkForm, "id">) });
  });

  // Sort by createdAt descending
  return forms.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Create a new TekLink form
 */
export async function createTekLinkForm(
  tenantId: string,
  businessName: string,
  data: {
    title: string;
    description?: string;
    fields: any[];
    logoUrl?: string;
  }
): Promise<TekLinkForm> {
  const db = getDb();

  // Find unique slug
  let slug = generateSlug(6);
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const existing = await db
      .collection("teklink_forms")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (existing.empty) {
      isUnique = true;
    } else {
      slug = generateSlug(6 + attempts);
      attempts++;
    }
  }

  const now = Date.now();
  const formRef = db.collection("teklink_forms").doc();

  const newForm: TekLinkForm = {
    id: formRef.id,
    tenantId,
    slug,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    businessName: businessName.trim() || "İşletme",
    logoUrl: data.logoUrl || "",
    fields: data.fields || [],
    isActive: true,
    responseCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await formRef.set(newForm);
  return newForm;
}

/**
 * Get a single form ensuring tenant ownership
 */
export async function getTenantFormById(tenantId: string, formId: string): Promise<TekLinkForm | null> {
  const db = getDb();
  const doc = await db.collection("teklink_forms").doc(formId).get();

  if (!doc.exists) return null;
  const data = doc.data() as Omit<TekLinkForm, "id">;

  // Strict multi-tenant check
  if (data.tenantId !== tenantId) {
    return null;
  }

  return { id: doc.id, ...data };
}

/**
 * Update an existing form ensuring tenant ownership
 */
export async function updateTenantForm(
  tenantId: string,
  formId: string,
  updates: Partial<Pick<TekLinkForm, "title" | "description" | "fields" | "isActive" | "businessName">>
): Promise<boolean> {
  const db = getDb();
  const formRef = db.collection("teklink_forms").doc(formId);
  const doc = await formRef.get();

  if (!doc.exists) return false;
  if (doc.data()?.tenantId !== tenantId) return false;

  await formRef.update({
    ...updates,
    updatedAt: Date.now(),
  });

  return true;
}

/**
 * Delete a form ensuring tenant ownership
 */
export async function deleteTenantForm(tenantId: string, formId: string): Promise<boolean> {
  const db = getDb();
  const formRef = db.collection("teklink_forms").doc(formId);
  const doc = await formRef.get();

  if (!doc.exists) return false;
  if (doc.data()?.tenantId !== tenantId) return false;

  await formRef.delete();
  return true;
}

/**
 * Public Form Lookup by Slug (Returns ONLY public customer-facing fields)
 */
export async function getPublicFormBySlug(slug: string): Promise<TekLinkPublicForm | null> {
  const db = getDb();
  const snap = await db
    .collection("teklink_forms")
    .where("slug", "==", slug.toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const data = doc.data() as TekLinkForm;

  if (!data.isActive) return null;

  return {
    slug: data.slug,
    title: data.title,
    description: data.description || "",
    businessName: data.businessName || "İşletme",
    logoUrl: data.logoUrl || "",
    fields: data.fields || [],
  };
}

/**
 * Submit customer response for a public form
 */
export async function submitPublicFormResponse(
  slug: string,
  answers: Record<string, any>,
  files?: any[]
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  const db = getDb();
  const formSnap = await db
    .collection("teklink_forms")
    .where("slug", "==", slug.toLowerCase().trim())
    .limit(1)
    .get();

  if (formSnap.empty) {
    return { success: false, error: "Form bulunamadı veya bağlantı aktif değil." };
  }

  const formDoc = formSnap.docs[0];
  const form = formDoc.data() as TekLinkForm;

  if (!form.isActive) {
    return { success: false, error: "Bu form şu an yeni yanıtlara kapalıdır." };
  }

  // Validate required fields
  for (const field of form.fields) {
    if (field.required) {
      const val = answers[field.id];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        return { success: false, error: `"${field.label}" alanı zorunludur.` };
      }
    }
  }

  // Extract quick summary for sender (name, email, or phone)
  let senderSummary = "Müşteri Yanıtı";
  const emailField = form.fields.find((f) => f.type === "email");
  const phoneField = form.fields.find((f) => f.type === "phone");
  const nameField = form.fields.find((f) => f.label.toLowerCase().includes("ad") || f.label.toLowerCase().includes("isim"));

  if (nameField && answers[nameField.id]) {
    senderSummary = String(answers[nameField.id]);
    if (phoneField && answers[phoneField.id]) {
      senderSummary += ` (${answers[phoneField.id]})`;
    }
  } else if (phoneField && answers[phoneField.id]) {
    senderSummary = String(answers[phoneField.id]);
  } else if (emailField && answers[emailField.id]) {
    senderSummary = String(answers[emailField.id]);
  }

  const submissionRef = db.collection("teklink_submissions").doc();
  const submissionData: TekLinkSubmission = {
    id: submissionRef.id,
    formId: formDoc.id,
    tenantId: form.tenantId,
    formTitle: form.title,
    answers,
    files: files || [],
    senderSummary,
    createdAt: Date.now(),
  };

  await submissionRef.set(submissionData);

  // Increment response count
  await formDoc.ref.update({
    responseCount: (form.responseCount || 0) + 1,
  });

  return { success: true, submissionId: submissionRef.id };
}

/**
 * Get submissions for a form ensuring tenant ownership
 */
export async function getFormSubmissions(tenantId: string, formId: string): Promise<TekLinkSubmission[]> {
  const db = getDb();

  // Verify form belongs to tenant
  const form = await getTenantFormById(tenantId, formId);
  if (!form) return [];

  const snap = await db
    .collection("teklink_submissions")
    .where("formId", "==", formId)
    .where("tenantId", "==", tenantId)
    .get();

  const submissions: TekLinkSubmission[] = [];
  snap.forEach((doc) => {
    submissions.push({ id: doc.id, ...(doc.data() as Omit<TekLinkSubmission, "id">) });
  });

  return submissions.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get tenant summary metrics for dashboard
 */
export async function getTenantDashboardStats(tenantId: string) {
  const db = getDb();
  const forms = await getTenantForms(tenantId);

  const totalForms = forms.length;
  const activeLinks = forms.filter((f) => f.isActive).length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);

  // Get recent 5 submissions across all forms
  const recentSnap = await db
    .collection("teklink_submissions")
    .where("tenantId", "==", tenantId)
    .limit(10)
    .get();

  const recentSubmissions: TekLinkSubmission[] = [];
  recentSnap.forEach((doc) => {
    recentSubmissions.push({ id: doc.id, ...(doc.data() as Omit<TekLinkSubmission, "id">) });
  });

  recentSubmissions.sort((a, b) => b.createdAt - a.createdAt);

  return {
    totalForms,
    activeLinks,
    totalSubmissions,
    forms,
    recentSubmissions: recentSubmissions.slice(0, 5),
  };
}
