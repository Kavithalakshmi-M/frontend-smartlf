import apiClient from "./axios";

/**
 * Formats ISO LocalDateTime to relative time string.
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "Just now";
  }
};

/**
 * Maps backend NotificationResponse DTO to UI shape.
 */
export const mapNotificationToUI = (notif) => {
  if (!notif) return null;

  let uiType = "info";
  if (notif.type === "CLAIM_APPROVED" || notif.type === "MATCH_CONFIRMED") {
    uiType = "success";
  } else if (notif.type === "CLAIM_REJECTED") {
    uiType = "warning";
  }

  return {
    id: notif.id,
    title: notif.title || "Notification",
    body: notif.message || "",
    time: formatRelativeTime(notif.createdAt),
    type: uiType,
    read: Boolean(notif.isRead),
    rawType: notif.type,
    createdAt: notif.createdAt,
  };
};

/**
 * Helper to extract current user ID from session.
 */
const getCurrentUserId = () => {
  const userRaw = localStorage.getItem("smartlf_user");
  return userRaw ? JSON.parse(userRaw).userId : null;
};

/**
 * Get User Notifications (GET /api/notifications/user/{userId})
 */
export const getNotificationsApi = async () => {
  const userId = getCurrentUserId();
  if (!userId) return { content: [], totalElements: 0 };
  const response = await apiClient.get(`/api/notifications/user/${userId}`);
  const notifs = (response.data || []).map(mapNotificationToUI);
  return {
    content: notifs,
    totalElements: notifs.length,
  };
};

/**
 * Mark Notification as Read (PATCH /api/notifications/{id}/read)
 */
export const markNotificationReadApi = async (id) => {
  const response = await apiClient.patch(`/api/notifications/${id}/read`);
  return mapNotificationToUI(response.data);
};

/**
 * Get Unread Notifications (GET /api/notifications/user/{userId}/unread)
 */
export const getUnreadNotificationsApi = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const response = await apiClient.get(`/api/notifications/user/${userId}/unread`);
  return (response.data || []).map(mapNotificationToUI);
};

export const getUnreadCountApi = async () => {
  const unread = await getUnreadNotificationsApi();
  return unread.length;
};

/**
 * Create Notification (POST /api/notifications)
 * @param {number|string} userId
 * @param {string} message
 * @param {string} type - "ITEM", "CLAIM", "MATCH", or "SYSTEM"
 */
export const createNotificationApi = async (userId, message, type = "SYSTEM") => {
  if (!userId) return null;
  try {
    const payload = {
      userId: Number(userId),
      message: String(message),
      type: type
    };
    const response = await apiClient.post("/api/notifications", payload);
    return mapNotificationToUI(response.data);
  } catch (err) {
    console.error("Failed to create notification on backend:", err);
    return null;
  }
};
