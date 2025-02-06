const getAuthHeaders = (token: string | null): HeadersInit => {
  if (!token) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1`;

export { getAuthHeaders, apiUrl };
