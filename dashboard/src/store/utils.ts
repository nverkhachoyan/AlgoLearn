export const TOKEN_STORAGE_KEY = "auth_token";
export const REFRESH_TOKEN_STORAGE_KEY = "auth_refresh_token";

export const getAuthHeaders = (token: string | null): HeadersInit => {
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

export const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1`;

export type ParsedImgKey = {
  imgObjectKey: string;
  mediaExtension: string;
};

export const parseImgKey = (imgKey: string): ParsedImgKey | undefined => {
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

export const buildImgUrl = (
  resource?: string,
  folderObjectKey?: string,
  objectKey?: string,
  mediaExt?: string
) => {
  if (!resource || !folderObjectKey || !objectKey || !mediaExt) {
    return "";
  }
  const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;
  const region = import.meta.env.VITE_S3_REGION;
  const endpoint = import.meta.env.VITE_S3_ENDPOINT;
  return `https://${bucketName}.${region}.${endpoint}/${resource}/${folderObjectKey}/${objectKey}.${mediaExt}`;
};

export const getRefreshedTokens = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  try {
    const resp = await fetch(`${apiUrl}/users/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });

    if (!resp.ok) {
      throw new Error(`Token refresh failed with status: ${resp.status}`);
    }

    const data = await resp.json();
    const payload = data.payload;

    if (!payload || !payload.token || !payload.refreshToken) {
      throw new Error("Invalid response format from refresh token endpoint");
    }

    const newToken = payload.token;
    const newRefreshToken = payload.refreshToken;
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);

    return Promise.resolve({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};
