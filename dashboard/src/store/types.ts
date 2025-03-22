export interface RequestController {
  [key: string]: AbortController | null;
}

export interface UserPreferences {
  theme: "light" | "dark";
  lang: string;
  timezone: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  cpus: number;
  preferences: UserPreferences;
  profilePictureUrl?: string;
}
