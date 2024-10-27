export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  oauth_id?: string;
  role: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  last_login_at?: string; // ISO date string
  is_active: boolean;
  is_email_verified: boolean;
  bio?: string;
  location?: string;
  cpus: number;
  preferences?: string; // JSON string
  streaks?: Streak[];
  achievements?: UserAchievement[];
}

export interface Streak {
  id: number;
  user_id: number;
  start_date: string; // ISO date string
  end_date?: string; // ISO date string
  current_streak: number;
  longest_streak: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  achieved_at: string; // ISO date string
}