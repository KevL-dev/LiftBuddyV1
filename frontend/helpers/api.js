export function authHeaders(extra = {}) {
  const token = localStorage.getItem("authToken");
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}
