import apiClient from "./axios";
import { getImageUrl, formatDateForUI } from "./items";

/**
 * Maps backend MatchResponse DTO to UI shape.
 */
export const mapMatchToUI = (match) => {
  if (!match) return null;
  const rawScore = match.similarityScore != null ? match.similarityScore : match.confidenceScore;
  const score = rawScore != null ? (rawScore <= 1 ? rawScore * 100 : rawScore) : 85;

  let confidence = "low";
  if (score >= 90) confidence = "high";
  else if (score >= 80) confidence = "medium";

  const resolvedImg = match.foundItemId ? getImageUrl(`/api/items/images/${match.foundItemId}`) : null;

  return {
    id: match.id,
    lostItemId: match.lostItemId,
    foundItemId: match.foundItemId,
    lostItemName: match.lostItemName || `Lost Item #${match.lostItemId}`,
    foundItemName: match.foundItemName || `Found Item #${match.foundItemId}`,
    lostItem: match.lostItemName || `Lost Item #${match.lostItemId}`,
    foundItem: match.foundItemName || `Found Item #${match.foundItemId}`,
    score: Math.round(score),
    confidence: confidence,
    station: match.station || match.stationName || "Station Vault",
    date: formatDateForUI(match.createdAt),
    img: resolvedImg,
    imageUrl: resolvedImg,
    description: match.foundItemDescription || match.description || `AI match detected between lost item #${match.lostItemId} and found item #${match.foundItemId}`,
    rawStatus: match.status || "PENDING",
    createdAt: match.createdAt,
  };
};

/**
 * Create Match (POST /api/matches)
 */
export const createMatchApi = async (lostItemId, foundItemId) => {
  const response = await apiClient.post("/api/matches", {
    lostItemId,
    foundItemId,
  });
  return mapMatchToUI(response.data);
};

/**
 * Get matches for lost item (GET /api/matches/lost/{lostItemId})
 */
export const getMatchesByLostItemApi = async (lostItemId) => {
  const response = await apiClient.get(`/api/matches/lost/${lostItemId}`);
  return (response.data || []).map(mapMatchToUI);
};

/**
 * Get matches for found item (GET /api/matches/found/{foundItemId})
 */
export const getMatchesByFoundItemApi = async (foundItemId) => {
  const response = await apiClient.get(`/api/matches/found/${foundItemId}`);
  return (response.data || []).map(mapMatchToUI);
};

/**
 * Get matches by status (GET /api/matches/status/{status})
 * Backend statuses: PENDING, CONFIRMED, REJECTED
 */
export const getMatchesByStatusApi = async (status = "PENDING") => {
  const response = await apiClient.get(`/api/matches/status/${status}`);
  return (response.data || []).map(mapMatchToUI);
};

export const getMatchesForUserApi = async () => {
  return getMatchesByStatusApi("PENDING");
};

/**
 * Update Match Status (PATCH /api/matches/{matchId}/status?status=...)
 * Status: PENDING, CONFIRMED, REJECTED
 */
export const updateMatchStatusApi = async (matchId, status) => {
  const response = await apiClient.patch(`/api/matches/${matchId}/status`, null, {
    params: { status },
  });
  return mapMatchToUI(response.data);
};

export const triggerMatchRescanApi = async (itemId = null) => {
  if (itemId) {
    try {
      const response = await apiClient.post(`/api/matches/evaluate/${itemId}`);
      const matches = (response.data || []).map(mapMatchToUI);
      if (matches.length > 0) return matches;
    } catch (e) {
      console.warn(`Failed to trigger match evaluation for item ${itemId}:`, e);
    }
  }
  return getMatchesByStatusApi("PENDING");
};
