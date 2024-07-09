import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User } from "@/types/userTypes";

export const useFetchUser = (token: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUserFetch, setLoadingUserFetch] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoadingUserFetch(false);
      return;
    }

    try {
      const response = await axios.get("https://algolearn.app/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        const userData = response.data.data;
        setUser({ ...userData, token });
      } else {
        console.error("Error fetching user data:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingUserFetch(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    setUser,
    loadingUserFetch,
    setLoadingUserFetch,
    refetch: fetchUser,
  };
};
