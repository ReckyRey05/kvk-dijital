/**
 * İtemSepeti — Notification Service
 * In-app push and activity feed generator for orders, disputes, and approvals.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { ItemSepetiNotification, ItemSepetiNotificationEvent } from "@/types/marketplace";

const inMemoryNotifications = new Map<string, ItemSepetiNotification[]>();

export async function sendNotification(params: {
  userId: string;
  event: ItemSepetiNotificationEvent;
  title: string;
  message: string;
  linkUrl: string;
}): Promise<ItemSepetiNotification> {
  const now = Date.now();
  const notif: ItemSepetiNotification = {
    id: `notif_${now}_${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    event: params.event,
    title: params.title,
    message: params.message,
    linkUrl: params.linkUrl,
    isRead: false,
    createdAt: now,
  };

  const userNotifs = inMemoryNotifications.get(params.userId) || [];
  userNotifs.unshift(notif);
  inMemoryNotifications.set(params.userId, userNotifs);

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_notifications").doc(notif.id).set(notif);
  } catch {}

  return notif;
}

export async function getUserNotifications(userId: string): Promise<ItemSepetiNotification[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ItemSepetiNotification);
    }
  } catch {}

  return inMemoryNotifications.get(userId) || [
    {
      id: "notif_welcome",
      userId,
      event: "ORDER_CREATED",
      title: "İtemSepeti'ne Hoş Geldiniz!",
      message: "Hesabınız başarıyla aktive edildi. Hemen pazar ilanlarına göz atın.",
      linkUrl: "/itemsepeti",
      isRead: false,
      createdAt: Date.now() - 3600000,
    },
  ];
}


export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  const userNotifs = inMemoryNotifications.get(userId) || [];
  const notif = userNotifs.find((n) => n.id === notificationId);
  if (notif) {
    notif.isRead = true;
  }

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_notifications").doc(notificationId).update({
      isRead: true,
      readAt: Date.now(),
    });
  } catch {}

  return true;
}
