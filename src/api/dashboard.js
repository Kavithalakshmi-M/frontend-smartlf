import apiClient from "./axios";
import { getLostItemsApi, getFoundItemsApi } from "./items";
import { getAllClaimsApi } from "./claims";
import { getMatchesByStatusApi } from "./matches";

/**
 * Maps Staff / Admin DashboardSummaryResponse DTO or constructs it from item lists.
 */
export const mapDashboardSummaryToUI = (data) => {
  if (!data) return null;
  return {
    totalLostItems: data.totalLostItems || 0,
    totalFoundItems: data.totalFoundItems || 0,
    totalMatches: data.totalMatches || 0,
    totalClaims: data.totalClaims || 0,
    pendingClaims: data.pendingClaims || 0,
    resolvedItems: data.resolvedItems || 0,
    recentLostItems: data.recentLostItems || [],
    recentFoundItems: data.recentFoundItems || [],
    recentClaims: data.recentClaims || [],
  };
};

/**
 * Get Staff Dashboard Summary
 */
export const getStaffDashboardApi = async () => {
  try {
    const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.allSettled([
      getLostItemsApi(),
      getFoundItemsApi(),
      getAllClaimsApi(),
      getMatchesByStatusApi("PENDING")
    ]);

    const lostItems = lostRes.status === "fulfilled" ? (lostRes.value?.content || []) : [];
    const foundItems = foundRes.status === "fulfilled" ? (foundRes.value?.content || []) : [];
    const claims = claimsRes.status === "fulfilled" ? (claimsRes.value?.content || claimsRes.value || []) : [];
    const matches = matchesRes.status === "fulfilled" ? (matchesRes.value || []) : [];

    const pendingClaims = claims.filter((c) => c.rawStatus === "PENDING" || c.status === "Under Verification");
    const resolvedCount = lostItems.filter((i) => i.rawStatus === "RESOLVED").length + foundItems.filter((i) => i.rawStatus === "RESOLVED").length;

    return mapDashboardSummaryToUI({
      totalLostItems: lostItems.length,
      totalFoundItems: foundItems.length,
      totalMatches: matches.length,
      totalClaims: claims.length,
      pendingClaims: pendingClaims.length,
      resolvedItems: resolvedCount,
      recentLostItems: lostItems.slice(0, 5),
      recentFoundItems: foundItems.slice(0, 5),
      recentClaims: claims.slice(0, 5),
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return mapDashboardSummaryToUI({});
  }
};

/**
 * Get Admin Dashboard Summary
 */
export const getAdminDashboardApi = getStaffDashboardApi;

/**
 * Get System Analytics dynamically derived from loaded database items.
 */
export const getAnalyticsApi = async () => {
  try {
    const [lostRes, foundRes, claimsRes] = await Promise.allSettled([
      getLostItemsApi(),
      getFoundItemsApi(),
      getAllClaimsApi()
    ]);

    const lostItems = lostRes.status === "fulfilled" ? (lostRes.value?.content || []) : [];
    const foundItems = foundRes.status === "fulfilled" ? (foundRes.value?.content || []) : [];
    const claims = claimsRes.status === "fulfilled" ? (claimsRes.value?.content || claimsRes.value || []) : [];

    const approvedClaimsCount = claims.filter(c => c.rawStatus === "APPROVED" || c.status === "Approved").length;
    const totalReportsCount = lostItems.length + foundItems.length;
    const resolutionRate = totalReportsCount > 0 ? Math.round((approvedClaimsCount / totalReportsCount) * 100) : 0;

    const categoryMap = {};
    [...lostItems, ...foundItems].forEach(item => {
      const cat = item.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryData = Object.keys(categoryMap).map(cat => ({
      category: cat,
      count: categoryMap[cat]
    }));

    return {
      resolutionRatePercentage: resolutionRate,
      approvedClaimsCount,
      totalReportsCount,
      categoryDistribution: categoryData
    };
  } catch (err) {
    console.error("Analytics calculation error:", err);
    return {
      resolutionRatePercentage: 0,
      approvedClaimsCount: 0,
      totalReportsCount: 0,
      categoryDistribution: []
    };
  }
};
