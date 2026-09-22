import apiClient from "./axios";
import { getImageUrl, formatDateForUI } from "./items";

/**
 * Maps backend ClaimStatus to UI display status string.
 */
export const mapClaimStatusToUI = (status) => {
  if (!status) return "Under Verification";
  switch (String(status).toUpperCase()) {
    case "PENDING":
      return "Under Verification";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
};

/**
 * Maps backend ClaimResponse DTO to UI shape.
 */
export const mapClaimToUI = (claim) => {
  if (!claim) return null;

  const resolvedImg = claim.imageUrl ? getImageUrl(claim.imageUrl) : null;

  return {
    id: claim.id ? (typeof claim.id === "number" ? `CLM-${claim.id}` : claim.id) : `CLM-${Date.now()}`,
    rawId: claim.id,
    itemId: claim.itemId,
    claimantId: claim.claimantId,
    item: `Item #${claim.itemId}`,
    claimant: claim.userName || `User #${claim.claimantId}`,
    userName: claim.userName || null,
    date: formatDateForUI(claim.createdAt),
    station: "Station Vault",
    status: mapClaimStatusToUI(claim.status),
    rawStatus: claim.status,
    notes: claim.notes || "",
    description: claim.description || "",
    verificationProof: claim.description || "",
    answers: { color: claim.description || "N/A", brand: "Checked", marks: "Verified", contents: "N/A" },
    imageKey: claim.imageKey || null,
    imageUrl: resolvedImg,
    proofImg: resolvedImg,
    createdAt: claim.createdAt,
  };
};

/**
 * Submit Ownership Claim (POST /api/claims)
 */
export const submitClaimApi = async (requestData, proofFile = null) => {
  const rawItemId = requestData.itemId || requestData.foundItemId || requestData.lostItemId;
  if (!rawItemId || isNaN(Number(rawItemId))) {
    throw new Error("Valid numeric item ID is required to submit an ownership claim.");
  }

  const payload = {
    itemId: Number(rawItemId),
    description: requestData.description || requestData.verificationProof || requestData.proofDescription || "Ownership Claim",
  };

  let response;
  if (proofFile && (proofFile instanceof File || proofFile instanceof Blob)) {
    const formData = new FormData();
    formData.append("claim", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    formData.append("image", proofFile);
    response = await apiClient.post("/api/claims", formData, {
      headers: { "Content-Type": undefined }
    });
  } else {
    response = await apiClient.post("/api/claims", payload);
  }

  return mapClaimToUI(response.data);
};

/**
 * Get Claim by ID (GET /api/claims/{id})
 */
export const getClaimByIdApi = async (id) => {
  const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) || id : id;
  const response = await apiClient.get(`/api/claims/${numericId}`);
  return mapClaimToUI(response.data);
};

/**
 * Get Current User's Claims (GET /api/claims/my)
 */
export const getMyClaimsApi = async () => {
  const response = await apiClient.get("/api/claims/my");
  return (response.data || []).map(mapClaimToUI);
};

/**
 * Get Claims for Item (GET /api/claims/item/{itemId})
 */
export const getClaimsByItemApi = async (itemId) => {
  const numericId = typeof itemId === "string" ? parseInt(itemId.replace(/\D/g, ""), 10) || itemId : itemId;
  const response = await apiClient.get(`/api/claims/item/${numericId}`);
  return (response.data || []).map(mapClaimToUI);
};

/**
 * Update Claim Status (PATCH /api/claims/{id}/status?status=...&notes=...)
 * Status: "PENDING", "APPROVED", or "REJECTED"
 */
export const updateClaimStatusApi = async (id, status, notes = null) => {
  const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) || id : id;
  const params = { status };
  if (notes) params.notes = notes;
  const response = await apiClient.patch(`/api/claims/${numericId}/status`, null, { params });
  return mapClaimToUI(response.data);
};

export const reviewClaimApi = updateClaimStatusApi;

/**
 * List All Claims (GET /api/claims with fallback to /api/claims/my)
 */
export const getAllClaimsApi = async () => {
  try {
    const response = await apiClient.get("/api/claims");
    const claims = (response.data || []).map(mapClaimToUI);
    return {
      content: claims,
      totalElements: claims.length,
    };
  } catch (err) {
    const response = await apiClient.get("/api/claims/my");
    const claims = (response.data || []).map(mapClaimToUI);
    return {
      content: claims,
      totalElements: claims.length,
    };
  }
};
