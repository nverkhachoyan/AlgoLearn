export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  oauthId?: string;
  role: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  lastLoginAt?: string; // ISO date string
  isActive: boolean;
  isEmailVerified: boolean;
  bio?: string;
  location?: string;
  cpus: number;
  preferences?: string; // JSON string
  streaks?: Streak[];
  achievements?: UserAchievement[];
}

export interface Streak {
  id: number;
  userId: number;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  currentStreak: number;
  longestStreak: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  achievedAt: string; // ISO date string
}
