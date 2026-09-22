import apiClient from "./axios";

/**
 * Authenticates user credentials with the API Gateway.
 * POST /api/auth/login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Response data containing { token, userId, name, email, role }
 */
export const loginApi = async (credentials) => {
  const response = await apiClient.post("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return response.data;
};

/**
 * Registers a new USER account with the API Gateway.
 * POST /api/users/register
 * @param {Object} userData - { name, email, phone, password }
 * @returns {Promise<Object>} Response data from registration
 */
export const registerApi = async (userData) => {
  const response = await apiClient.post("/api/users/register", {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
  });
  return response.data;
};

/**
 * Updates user profile details (name, phone, notification preferences).
 * PUT /api/users/{userId}
 */
export const updateProfileApi = async (userId, profileData) => {
  const response = await apiClient.put(`/api/users/${userId}`, profileData);
  return response.data;
};

/**
 * Changes user password.
 * PUT /api/users/{userId}/password
 */
export const changePasswordApi = async (userId, passwordData) => {
  const response = await apiClient.put(`/api/users/${userId}/password`, passwordData);
  return response.data;
};

/**
 * Fetches latest user profile by ID.
 * GET /api/users/{userId}
 */
export const getUserProfileApi = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.data;
};

/**
 * Fetches list of all registered users (STAFF / ADMIN only).
 * GET /api/users
 */
export const getAllUsersApi = async () => {
  const response = await apiClient.get("/api/users");
  return response.data;
};

/**
 * Deletes a user account (ADMIN / STAFF only).
 * DELETE /api/users/{userId}
 */
export const deleteUserApi = async (userId) => {
  const response = await apiClient.delete(`/api/users/${userId}`);
  return response.data;
};
