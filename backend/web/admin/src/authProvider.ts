import { AuthProvider } from "react-admin";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await fetch("/api/v1/users/sign-in", {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Invalid credentials");
    }

    if (data.payload.user.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    localStorage.setItem("token", data.payload.token);
    localStorage.setItem("refreshToken", data.payload.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.payload.user));
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem("token") ? Promise.resolve() : Promise.reject();
  },

  getPermissions: () => {
    const user = localStorage.getItem("user");
    if (!user) return Promise.reject();

    const { role } = JSON.parse(user);
    return role === "admin" ? Promise.resolve("admin") : Promise.reject();
  },

  getIdentity: () => {
    const user = localStorage.getItem("user");
    if (!user) return Promise.reject();

    const parsedUser = JSON.parse(user);
    return Promise.resolve({
      id: parsedUser.id,
      fullName: parsedUser.username,
      avatar: parsedUser.profilePictureURL,
    });
  },
};
