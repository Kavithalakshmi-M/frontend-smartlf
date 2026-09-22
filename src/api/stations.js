import api from "./axios";

export async function getStationsApi() {
  const res = await api.get("/api/stations");
  return res.data;
}

export async function createStationApi(stationData) {
  const res = await api.post("/api/stations", stationData);
  return res.data;
}

export async function updateStationApi(id, stationData) {
  const res = await api.put(`/api/stations/${id}`, stationData);
  return res.data;
}

export async function deleteStationApi(id) {
  const res = await api.delete(`/api/stations/${id}`);
  return res.data;
}
