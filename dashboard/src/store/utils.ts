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

export type ParsedImgKey = {
  imgObjectKey: string;
  mediaExtension: string;
};

const parseImgKey = (imgKey: string): ParsedImgKey | undefined => {
  if (!imgKey) {
    return undefined;
  }
  const originalKey = imgKey.split("/").pop();
  if (!originalKey) {
    return undefined;
  }
  const parts = originalKey.split(".");
  if (parts.length !== 2) {
    return undefined;
  }

  const imgObjectKey = parts[0];
  const mediaExtension = parts[1];
  return {
    imgObjectKey,
    mediaExtension,
  };
};

export { getAuthHeaders, apiUrl, parseImgKey };
