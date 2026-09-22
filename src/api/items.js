import apiClient from "./axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * Resolves relative backend image URLs to full Gateway URLs.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};

/**
 * Converts backend status enums (ACTIVE, CLAIMED, RESOLVED) into UI strings.
 */
export const mapStatusToUI = (status) => {
  if (!status) return "Active";
  switch (String(status).toUpperCase()) {
    case "ACTIVE":
      return "Active";
    case "CLAIMED":
      return "Claimed";
    case "RESOLVED":
      return "Closed";
    default:
      return status;
  }
};

/**
 * Formats date string into readable UI format.
 */
export const formatDateForUI = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Maps backend ItemResponse DTO to existing UI component shape.
 */
export const mapItemToUI = (item) => {
  if (!item) return null;
  let rawImgPath = null;
  if (item.imageUrl && (item.imageUrl.startsWith("http://") || item.imageUrl.startsWith("https://") || item.imageUrl.startsWith("data:"))) {
    rawImgPath = item.imageUrl;
  } else if (item.imageUrl && item.imageUrl.startsWith("/api/items/images/")) {
    rawImgPath = item.imageUrl;
  } else if (item.imageKey || item.id) {
    rawImgPath = `/api/items/images/${item.id}`;
  }
  const resolvedImg = getImageUrl(rawImgPath);

  return {
    id: item.id,
    item: item.title,
    title: item.title,
    name: item.title,
    category: item.category,
    station: item.location,
    location: item.location,
    locationLost: item.location,
    locationFound: item.location,
    date: formatDateForUI(item.dateReported || item.createdAt),
    dateLost: item.dateReported || item.createdAt,
    dateFound: item.dateReported || item.createdAt,
    time: "12:00",
    status: mapStatusToUI(item.status),
    rawStatus: item.status,
    reporter: item.reportedBy ? `User #${item.reportedBy}` : "Passenger",
    desc: item.description,
    description: item.description,
    imageKey: item.imageKey || null,
    imageUrl: resolvedImg,
    img: resolvedImg,
    reportedBy: item.reportedBy,
    type: item.type,
    createdAt: item.createdAt,
  };
};

/**
 * Formats date values into Jackson-compatible ISO LocalDateTime strings (YYYY-MM-DDTHH:mm:ss).
 */
export const formatDateForBackend = (dateVal) => {
  if (!dateVal) return new Date().toISOString().slice(0, 19);
  if (typeof dateVal === "string") {
    let clean = dateVal.trim().split("Z")[0].split(".")[0];
    if (clean.length === 10) {
      return `${clean}T12:00:00`;
    }
    if (clean.includes("T")) {
      return clean;
    }
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19);
    return d.toISOString().slice(0, 19);
  } catch (e) {
    return new Date().toISOString().slice(0, 19);
  }
};

export const mapLostItemToUI = mapItemToUI;
export const mapFoundItemToUI = mapItemToUI;

// ─── LOST ITEM APIS ──────────────────────────────────────────────────────────

/**
 * Create Lost Item (POST /api/items)
 */
export const createLostItemApi = async (requestData) => {
  const payload = {
    title: requestData.title || requestData.item,
    description: requestData.description || requestData.desc || "",
    category: requestData.category,
    location: requestData.location || requestData.station || requestData.locationLost,
    dateReported: formatDateForBackend(requestData.dateReported || requestData.dateLost),
    imageUrl: typeof requestData.imageUrl === "string" ? requestData.imageUrl : "",
    type: "LOST",
  };

  const imageFile = requestData.file || requestData.imageFile || requestData.image;

  let response;
  if (imageFile && (imageFile instanceof File || imageFile instanceof Blob)) {
    const formData = new FormData();
    formData.append("item", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    formData.append("image", imageFile);
    response = await apiClient.post("/api/items", formData, {
      headers: { "Content-Type": undefined }
    });
  } else {
    response = await apiClient.post("/api/items", payload);
  }

  const mapped = mapItemToUI(response.data);
  if (mapped && mapped.id) {
    apiClient.post(`/api/matches/evaluate/${mapped.id}`).catch(() => {});
  }
  return mapped;
};

/**
 * Get Lost Items (GET /api/items/type/LOST or GET /api/items)
 */
export const getLostItemsApi = async () => {
  const response = await apiClient.get("/api/items/type/LOST");
  const items = (response.data || []).map(mapItemToUI);
  return {
    content: items,
    totalElements: items.length,
  };
};

/**
 * Get Lost Item by ID (GET /api/items/{id})
 */
export const getLostItemByIdApi = async (id) => {
  const response = await apiClient.get(`/api/items/${id}`);
  return mapItemToUI(response.data);
};

/**
 * Get Current User's Lost Items (GET /api/items/user/{userId})
 */
export const getMyLostItemsApi = async () => {
  const userRaw = localStorage.getItem("smartlf_user");
  const userId = userRaw ? JSON.parse(userRaw).userId : null;
  if (!userId) return [];
  const response = await apiClient.get(`/api/items/user/${userId}`);
  return (response.data || [])
    .filter((item) => item.type === "LOST")
    .map(mapItemToUI);
};

/**
 * Update Lost Item Status (PATCH /api/items/{id}/status?status=...)
 */
export const updateLostItemStatusApi = async (id, status) => {
  const response = await apiClient.patch(`/api/items/${id}/status`, null, {
    params: { status },
  });
  return mapItemToUI(response.data);
};

/**
 * Delete Lost Item (DELETE /api/items/{id})
 */
export const deleteLostItemApi = async (id) => {
  const response = await apiClient.delete(`/api/items/${id}`);
  return response.data;
};

// ─── FOUND ITEM APIS ─────────────────────────────────────────────────────────

/**
 * Create Found Item (POST /api/items)
 */
export const createFoundItemApi = async (requestData) => {
  const payload = {
    title: requestData.title || requestData.name || requestData.item,
    description: requestData.description || requestData.desc || "",
    category: requestData.category,
    location: requestData.location || requestData.station || requestData.locationFound,
    dateReported: formatDateForBackend(requestData.dateReported || requestData.dateFound),
    imageUrl: typeof requestData.imageUrl === "string" ? requestData.imageUrl : "",
    type: "FOUND",
  };

  const imageFile = requestData.file || requestData.imageFile || requestData.image;

  let response;
  if (imageFile && (imageFile instanceof File || imageFile instanceof Blob)) {
    const formData = new FormData();
    formData.append("item", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    formData.append("image", imageFile);
    response = await apiClient.post("/api/items", formData, {
      headers: { "Content-Type": undefined }
    });
  } else {
    response = await apiClient.post("/api/items", payload);
  }

  const mapped = mapItemToUI(response.data);
  if (mapped && mapped.id) {
    apiClient.post(`/api/matches/evaluate/${mapped.id}`).catch(() => {});
  }
  return mapped;
};

/**
 * Get Found Items (GET /api/items/type/FOUND)
 */
export const getFoundItemsApi = async () => {
  const response = await apiClient.get("/api/items/type/FOUND");
  const items = (response.data || []).map(mapItemToUI);
  return {
    content: items,
    totalElements: items.length,
  };
};

/**
 * Get Found Item by ID (GET /api/items/{id})
 */
export const getFoundItemByIdApi = async (id) => {
  const response = await apiClient.get(`/api/items/${id}`);
  return mapItemToUI(response.data);
};

/**
 * Get Current User's Found Items (GET /api/items/user/{userId})
 */
export const getMyFoundItemsApi = async () => {
  const userRaw = localStorage.getItem("smartlf_user");
  const userId = userRaw ? JSON.parse(userRaw).userId : null;
  if (!userId) return [];
  const response = await apiClient.get(`/api/items/user/${userId}`);
  return (response.data || [])
    .filter((item) => item.type === "FOUND")
    .map(mapItemToUI);
};

/**
 * Update Found Item Status (PATCH /api/items/{id}/status?status=...)
 */
export const updateFoundItemStatusApi = async (id, status) => {
  const response = await apiClient.patch(`/api/items/${id}/status`, null, {
    params: { status },
  });
  return mapItemToUI(response.data);
};

/**
 * Delete Found Item (DELETE /api/items/{id})
 */
export const deleteFoundItemApi = async (id) => {
  const response = await apiClient.delete(`/api/items/${id}`);
  return response.data;
};

/**
 * List All Items (GET /api/items)
 */
export const getAllItemsApi = async () => {
  const response = await apiClient.get("/api/items");
  return (response.data || []).map(mapItemToUI);
};
