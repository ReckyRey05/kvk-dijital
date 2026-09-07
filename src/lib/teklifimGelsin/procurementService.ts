import { getAdminDb } from "@/lib/firebase/admin";
import {
  TeklifimOrgRole,
  TeklifimTeamMember,
  TeklifimTeamInvitation,
  TeklifimProcurementList,
  TeklifimProcurementItem,
  TeklifimApprovalRecord,
  TeklifimProcurementPolicy,
  TeklifimAuditLog,
  TeklifimRequest,
  TeklifimOrder,
  TeklifimProfile,
} from "@/types/teklifimGelsin";
import {
  calculateApprovalRequired,
  generateSecureToken,
  convertListToRequestPayload,
} from "./procurementUtils";

function getDb() {
  return getAdminDb();
}

/**
 * Retrieves the procurement policy for a business, or returns defaults.
 */
export async function getProcurementPolicy(businessId: string): Promise<TeklifimProcurementPolicy> {
  const db = getDb();
  const docRef = db.collection("teklifim_procurement_policies").doc(`pol_${businessId}`);
  const snap = await docRef.get();

  if (snap.exists) {
    return snap.data() as TeklifimProcurementPolicy;
  }

  const defaultPolicy: TeklifimProcurementPolicy = {
    id: `pol_${businessId}`,
    businessId,
    approvalThreshold: 35000,
    requireApprovalForBulk: false,
    updatedAt: Date.now(),
    updatedBy: "system",
  };

  await docRef.set(defaultPolicy);
  return defaultPolicy;
}

/**
 * Updates procurement policy for a business.
 */
export async function updateProcurementPolicy(
  businessId: string,
  policyData: Partial<TeklifimProcurementPolicy>,
  actor: { id: string; name: string; role: TeklifimOrgRole }
): Promise<TeklifimProcurementPolicy> {
  const db = getDb();
  const docRef = db.collection("teklifim_procurement_policies").doc(`pol_${businessId}`);

  const updated: TeklifimProcurementPolicy = {
    id: `pol_${businessId}`,
    businessId,
    approvalThreshold: typeof policyData.approvalThreshold === "number" ? policyData.approvalThreshold : 35000,
    requireApprovalForBulk: Boolean(policyData.requireApprovalForBulk),
    allowedBuyerMaxAmount: policyData.allowedBuyerMaxAmount,
    updatedAt: Date.now(),
    updatedBy: actor.name || actor.id,
  };

  await docRef.set(updated, { merge: true });

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "policy_updated",
    entityType: "policy",
    entityId: updated.id,
    entityTitle: "Satin Alma Politikasi",
    metadata: { approvalThreshold: updated.approvalThreshold, requireApprovalForBulk: updated.requireApprovalForBulk },
  });

  return updated;
}

/**
 * Creates a new procurement list.
 */
export async function createProcurementList(
  businessId: string,
  listData: Partial<TeklifimProcurementList>,
  actor: { id: string; name: string; role: TeklifimOrgRole }
): Promise<TeklifimProcurementList> {
  const db = getDb();
  const listId = `lst_${Date.now()}_${generateSecureToken(4)}`;
  const items = listData.items || [];
  const totalEstimatedCost = items.reduce(
    (sum, it) => sum + (it.estimatedTotalPrice || (it.estimatedUnitPrice ? it.estimatedUnitPrice * it.quantity : 0)),
    0
  );

  const newList: TeklifimProcurementList = {
    id: listId,
    businessId,
    name: listData.name?.trim() || "Isletme Satin Alma Listesi",
    description: listData.description?.trim() || "",
    category: listData.category || items[0]?.category || "Genel Tedarik",
    items,
    totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
    itemCount: items.length,
    reminderFrequency: listData.reminderFrequency || "none",
    nextReminderDate: listData.nextReminderDate,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.collection("teklifim_procurement_lists").doc(listId).set(newList);

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "list_created",
    entityType: "procurement_list",
    entityId: listId,
    entityTitle: newList.name,
    metadata: { itemCount: items.length, totalEstimatedCost },
  });

  return newList;
}

/**
 * Gets all procurement lists for a business.
 */
export async function getProcurementLists(businessId: string): Promise<TeklifimProcurementList[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_procurement_lists")
    .where("businessId", "==", businessId)
    .get();

  const lists: TeklifimProcurementList[] = [];
  snap.forEach((doc) => lists.push(doc.data() as TeklifimProcurementList));
  return lists.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Gets a single procurement list by ID.
 */
export async function getProcurementListById(
  listId: string,
  businessId: string
): Promise<TeklifimProcurementList | null> {
  const db = getDb();
  const doc = await db.collection("teklifim_procurement_lists").doc(listId).get();
  if (!doc.exists) return null;

  const data = doc.data() as TeklifimProcurementList;
  if (data.businessId !== businessId) return null;

  return data;
}

/**
 * Updates a procurement list and recalculates estimated costs.
 */
export async function updateProcurementList(
  listId: string,
  businessId: string,
  listData: Partial<TeklifimProcurementList>,
  actor: { id: string; name: string; role: TeklifimOrgRole }
): Promise<TeklifimProcurementList | null> {
  const current = await getProcurementListById(listId, businessId);
  if (!current) return null;

  const items = listData.items !== undefined ? listData.items : current.items;
  const totalEstimatedCost = items.reduce(
    (sum, it) => sum + (it.estimatedTotalPrice || (it.estimatedUnitPrice ? it.estimatedUnitPrice * it.quantity : 0)),
    0
  );

  const updated: TeklifimProcurementList = {
    ...current,
    name: listData.name !== undefined ? listData.name.trim() : current.name,
    description: listData.description !== undefined ? listData.description.trim() : current.description,
    category: listData.category !== undefined ? listData.category : current.category,
    items,
    totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
    itemCount: items.length,
    reminderFrequency: listData.reminderFrequency !== undefined ? listData.reminderFrequency : current.reminderFrequency,
    nextReminderDate: listData.nextReminderDate !== undefined ? listData.nextReminderDate : current.nextReminderDate,
    updatedAt: Date.now(),
  };

  const db = getDb();
  await db.collection("teklifim_procurement_lists").doc(listId).set(updated);

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "list_updated",
    entityType: "procurement_list",
    entityId: listId,
    entityTitle: updated.name,
    metadata: { itemCount: items.length, totalEstimatedCost },
  });

  return updated;
}

/**
 * Deletes a procurement list.
 */
export async function deleteProcurementList(listId: string, businessId: string): Promise<boolean> {
  const current = await getProcurementListById(listId, businessId);
  if (!current) return false;

  const db = getDb();
  await db.collection("teklifim_procurement_lists").doc(listId).delete();
  return true;
}

/**
 * Creates a multi-item bulk procurement request or single request with approval checks.
 */
export async function createProcurementRequest(
  businessId: string,
  requestData: Partial<TeklifimRequest>,
  actor: { id: string; name: string; role: TeklifimOrgRole }
): Promise<TeklifimRequest> {
  const db = getDb();
  const policy = await getProcurementPolicy(businessId);

  const requestId = `req_${Date.now()}_${generateSecureToken(4)}`;
  const items = requestData.items || [];
  const isBulk = Boolean(requestData.isBulkProcurement || items.length > 1);

  // Determine budget and approval requirements
  const estimatedBudget = requestData.estimatedBudget || 0;
  const requiresApproval = calculateApprovalRequired(estimatedBudget, policy, isBulk);
  const approvalStatus = requiresApproval ? "pending_approval" : "not_required";

  const initialApprovalHistory: TeklifimApprovalRecord[] = requiresApproval
    ? [
        {
          id: `appr_${Date.now()}`,
          procurementRequestId: requestId,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "submitted",
          note: `Talep onaya gonderildi. Butce: ${estimatedBudget} TL (Esik: ${policy.approvalThreshold} TL)`,
          timestamp: Date.now(),
        },
      ]
    : [];

  const newRequest: TeklifimRequest = {
    id: requestId,
    businessId,
    businessName: requestData.businessName || "Isletme",
    businessCity: requestData.businessCity || "Istanbul",
    businessPhone: requestData.businessPhone,
    businessEmail: requestData.businessEmail,
    title: requestData.title?.trim() || "Satin Alma Talebi",
    category: requestData.category || items[0]?.category || "Genel Tedarik",
    subCategory: requestData.subCategory,
    productName: requestData.productName || items[0]?.productName || requestData.title,
    quantity: requestData.quantity || items.reduce((s, it) => s + (it.quantity || 0), 0) || 1,
    unit: requestData.unit || items[0]?.unit || "Adet",
    deliveryDays: requestData.deliveryDays || 7,
    city: requestData.city || requestData.businessCity || "Istanbul",
    district: requestData.district,
    description: requestData.description?.trim() || "",
    deadline: requestData.deadline,
    deadlineTimestamp: requestData.deadlineTimestamp,
    imageUrl: requestData.imageUrl,
    sampleRequired: requestData.sampleRequired || false,
    status: requiresApproval ? "open" : "published",
    offerCount: 0,
    isBulkProcurement: isBulk,
    items,
    estimatedBudget,
    approvalStatus,
    approvalThreshold: policy.approvalThreshold,
    approvalHistory: initialApprovalHistory,
    createdByRole: actor.role,
    fromListId: requestData.fromListId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.collection("teklifim_requests").doc(requestId).set(newRequest);

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: requiresApproval ? "request_submitted_approval" : "request_created",
    entityType: "procurement_request",
    entityId: requestId,
    entityTitle: newRequest.title,
    metadata: {
      isBulk,
      itemsCount: items.length,
      estimatedBudget,
      approvalStatus,
    },
  });

  return newRequest;
}

/**
 * Converts a procurement list to a published procurement request.
 */
export async function convertListToProcurementRequest(
  listId: string,
  businessId: string,
  actor: { id: string; name: string; role: TeklifimOrgRole },
  extra: { deliveryDays: number; deadline?: string; budget?: number }
): Promise<TeklifimRequest> {
  const list = await getProcurementListById(listId, businessId);
  if (!list) {
    throw new Error("Satin alma listesi bulunamadi.");
  }

  const db = getDb();
  // Fetch business profile details
  const profDoc = await db.collection("teklifim_profiles").doc(businessId).get();
  const profile = profDoc.data() as TeklifimProfile | undefined;

  const payload = convertListToRequestPayload(
    list,
    {
      id: businessId,
      name: profile?.companyName || "Isletme",
      city: profile?.city || "Istanbul",
      phone: profile?.phone,
      email: profile?.email,
    },
    extra.deliveryDays,
    extra.deadline,
    extra.budget
  );

  const req = await createProcurementRequest(businessId, payload, actor);

  // Update lastRequestedAt on list
  await db.collection("teklifim_procurement_lists").doc(listId).update({
    lastRequestedAt: Date.now(),
    updatedAt: Date.now(),
  });

  return req;
}

/**
 * Processes corporate approval (approve or reject) for a procurement request.
 * Guaranteed duplicate approval prevention.
 */
export async function processProcurementApproval(
  requestId: string,
  businessId: string,
  actor: { id: string; name: string; role: TeklifimOrgRole },
  action: "approved" | "rejected",
  note?: string
): Promise<TeklifimRequest> {
  const db = getDb();
  const reqDoc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!reqDoc.exists) {
    throw new Error("Satin alma talebi bulunamadi.");
  }

  const request = reqDoc.data() as TeklifimRequest;
  if (request.businessId !== businessId) {
    throw new Error("Bu talep uzerinde islem yapma yetkiniz bulunmuyor.");
  }

  // Duplicate approval prevention
  if (request.approvalStatus === "approved" || request.approvalStatus === "rejected") {
    throw new Error(`Bu talep zaten '${request.approvalStatus}' durumundadir, tekrar islem yapilamaz.`);
  }

  const newRecord: TeklifimApprovalRecord = {
    id: `appr_${Date.now()}`,
    procurementRequestId: requestId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    note: note || (action === "approved" ? "Satin alma talebi onaylandi." : "Satin alma talebi reddedildi."),
    timestamp: Date.now(),
  };

  const history = request.approvalHistory ? [...request.approvalHistory, newRecord] : [newRecord];

  const updatedStatus = action === "approved" ? "published" : "cancelled";

  await db.collection("teklifim_requests").doc(requestId).update({
    approvalStatus: action,
    status: updatedStatus,
    approvalHistory: history,
    updatedAt: Date.now(),
  });

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: action === "approved" ? "request_approved" : "request_rejected",
    entityType: "procurement_request",
    entityId: requestId,
    entityTitle: request.title,
    metadata: { action, note },
  });

  return {
    ...request,
    approvalStatus: action,
    status: updatedStatus,
    approvalHistory: history,
    updatedAt: Date.now(),
  };
}

/**
 * Creates an unguessable, time-limited team invitation.
 */
export async function createTeamInvitation(
  businessId: string,
  businessName: string,
  email: string,
  role: TeklifimOrgRole,
  actor: { id: string; name: string }
): Promise<TeklifimTeamInvitation> {
  const db = getDb();
  const token = generateSecureToken(32);
  const invitationId = `inv_${token}`;

  const invitation: TeklifimTeamInvitation = {
    id: invitationId,
    businessId,
    businessName,
    email: email.trim().toLowerCase(),
    role,
    token,
    status: "pending",
    invitedBy: actor.id,
    invitedByName: actor.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    createdAt: Date.now(),
  };

  await db.collection("teklifim_team_invitations").doc(invitationId).set(invitation);

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: "owner",
    action: "team_invited",
    entityType: "team_member",
    entityId: invitationId,
    entityTitle: `Davet: ${email}`,
    metadata: { email, role, token },
  });

  return invitation;
}

/**
 * Retrieves an invitation by token and validates expiry.
 */
export async function getInvitationByToken(token: string): Promise<TeklifimTeamInvitation | null> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_team_invitations")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const inv = snap.docs[0].data() as TeklifimTeamInvitation;

  if (inv.status === "pending" && Date.now() > inv.expiresAt) {
    await db.collection("teklifim_team_invitations").doc(inv.id).update({
      status: "expired",
    });
    return { ...inv, status: "expired" };
  }

  return inv;
}

/**
 * Accepts a team invitation and registers member into business team.
 */
export async function acceptTeamInvitation(
  token: string,
  user: { uid: string; email: string; name: string }
): Promise<TeklifimTeamMember> {
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error("Gecersiz davet linki.");
  }
  if (invitation.status === "expired") {
    throw new Error("Davet suresi dolmustur.");
  }
  if (invitation.status === "accepted") {
    throw new Error("Bu davet zaten kabul edilmistir.");
  }

  const db = getDb();
  const memberId = `mem_${invitation.businessId}_${user.uid}`;

  const member: TeklifimTeamMember = {
    id: memberId,
    businessId: invitation.businessId,
    businessName: invitation.businessName,
    userId: user.uid,
    email: user.email.trim().toLowerCase(),
    name: user.name || user.email.split("@")[0],
    role: invitation.role,
    invitedBy: invitation.invitedBy,
    joinedAt: Date.now(),
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.collection("teklifim_team_members").doc(memberId).set(member);

  // Update invitation status
  await db.collection("teklifim_team_invitations").doc(invitation.id).update({
    status: "accepted",
    acceptedAt: Date.now(),
  });

  await recordAuditLog(invitation.businessId, {
    actorId: user.uid,
    actorName: member.name,
    actorRole: member.role,
    action: "team_invited",
    entityType: "team_member",
    entityId: memberId,
    entityTitle: `${member.name} ekibe katildi`,
    metadata: { role: member.role },
  });

  return member;
}

/**
 * Gets all team members for a business.
 */
export async function getTeamMembers(businessId: string): Promise<TeklifimTeamMember[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_team_members")
    .where("businessId", "==", businessId)
    .get();

  const members: TeklifimTeamMember[] = [];
  snap.forEach((doc) => members.push(doc.data() as TeklifimTeamMember));
  return members.sort((a, b) => a.joinedAt - b.joinedAt);
}

/**
 * Updates team member role.
 */
export async function updateTeamMemberRole(
  memberId: string,
  businessId: string,
  newRole: TeklifimOrgRole,
  actor: { id: string; name: string }
): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_team_members").doc(memberId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("Ekip uyesi bulunamadi.");

  const current = snap.data() as TeklifimTeamMember;
  if (current.businessId !== businessId) throw new Error("Yetkisiz erisim.");

  await docRef.update({ role: newRole, updatedAt: Date.now() });

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: "owner",
    action: "team_role_changed",
    entityType: "team_member",
    entityId: memberId,
    entityTitle: `${current.name} rolu guncellendi`,
    metadata: { oldRole: current.role, newRole },
  });
}

/**
 * Removes team member from business.
 */
export async function removeTeamMember(
  memberId: string,
  businessId: string,
  actor: { id: string; name: string }
): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_team_members").doc(memberId);
  const snap = await docRef.get();
  if (!snap.exists) return;

  const current = snap.data() as TeklifimTeamMember;
  if (current.businessId !== businessId) throw new Error("Yetkisiz erisim.");

  await docRef.delete();

  await recordAuditLog(businessId, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: "owner",
    action: "team_member_removed",
    entityType: "team_member",
    entityId: memberId,
    entityTitle: `${current.name} ekipten cikarildi`,
    metadata: { removedEmail: current.email },
  });
}

/**
 * Resolves user's organizational role inside a business.
 */
export async function getUserOrgRole(
  businessId: string,
  userId: string
): Promise<TeklifimOrgRole> {
  if (businessId === userId) return "owner";

  const db = getDb();
  const memberId = `mem_${businessId}_${userId}`;
  const snap = await db.collection("teklifim_team_members").doc(memberId).get();

  if (snap.exists) {
    const member = snap.data() as TeklifimTeamMember;
    if (member.status === "active") {
      return member.role;
    }
  }

  return "viewer";
}

/**
 * Records an immutable corporate audit log entry.
 */
export async function recordAuditLog(
  businessId: string,
  log: Omit<TeklifimAuditLog, "id" | "businessId" | "timestamp">
): Promise<void> {
  try {
    const db = getDb();
    const logId = `aud_${Date.now()}_${generateSecureToken(4)}`;
    const fullLog: TeklifimAuditLog = {
      id: logId,
      businessId,
      timestamp: Date.now(),
      ...log,
    };
    await db.collection("teklifim_audit_logs").doc(logId).set(fullLog);
  } catch (err) {
    console.error("Audit log kaydi olusturulamadi:", err);
  }
}

/**
 * Queries audit logs for a business.
 */
export async function getAuditLogs(
  businessId: string,
  limitCount: number = 50
): Promise<TeklifimAuditLog[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_audit_logs")
    .where("businessId", "==", businessId)
    .limit(limitCount)
    .get();

  const logs: TeklifimAuditLog[] = [];
  snap.forEach((doc) => logs.push(doc.data() as TeklifimAuditLog));
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Retrieves purchase history from completed and active orders for a business.
 */
export async function getPurchaseHistory(
  businessId: string,
  filters?: {
    startDate?: number;
    endDate?: number;
    category?: string;
    supplierId?: string;
    status?: string;
  }
): Promise<any[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_orders")
    .where("businessId", "==", businessId)
    .get();

  let orders: TeklifimOrder[] = [];
  snap.forEach((doc) => orders.push(doc.data() as TeklifimOrder));

  // Flatten into itemized purchase records for granular history table & export
  const purchases: any[] = [];

  for (const ord of orders) {
    if (filters?.supplierId && ord.supplierId !== filters.supplierId) continue;
    if (filters?.status && ord.status !== filters.status) continue;
    if (filters?.startDate && ord.createdAt < filters.startDate) continue;
    if (filters?.endDate && ord.createdAt > filters.endDate) continue;

    if (Array.isArray(ord.items) && ord.items.length > 0) {
      for (const item of ord.items) {
        if (filters?.category && item.category !== filters.category) continue;

        purchases.push({
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          requestId: ord.requestId,
          offerId: ord.offerId,
          agreementId: ord.agreementId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: ord.currency || "TL",
          supplierId: ord.supplierId,
          supplierName: ord.supplierName,
          createdAt: ord.createdAt,
          paymentStatus: ord.paymentStatus || "pending",
          status: ord.status,
          expectedDeliveryDate: ord.expectedDeliveryDate,
        });
      }
    } else {
      purchases.push({
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        requestId: ord.requestId,
        offerId: ord.offerId,
        agreementId: ord.agreementId,
        productName: ord.requestTitle,
        category: "Genel",
        quantity: ord.quantity || 1,
        unit: ord.unit || "Adet",
        unitPrice: ord.unitPrice || ord.totalPrice,
        totalPrice: ord.totalPrice,
        currency: ord.currency || "TL",
        supplierId: ord.supplierId,
        supplierName: ord.supplierName,
        createdAt: ord.createdAt,
        paymentStatus: ord.paymentStatus || "pending",
        status: ord.status,
        expectedDeliveryDate: ord.expectedDeliveryDate,
      });
    }
  }

  return purchases.sort((a, b) => b.createdAt - a.createdAt);
}
