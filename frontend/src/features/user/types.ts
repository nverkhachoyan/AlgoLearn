export interface UserPreferences {
  theme: string;
  lang: string;
  timezone: string;
}

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
  role: string;
  lastLoginAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  cpus: number;
  streak: number;
  lastStreakDate?: String;
  preferences: UserPreferences;
  profilePictureURL?: string;
}
