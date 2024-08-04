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

export interface Course {
  id: number;
  name: string;
  description: string;
  background_color: string;
  icon_url?: string;
  duration?: string;
  difficulty_level?: string;
  author?: string;
  tags?: string[];
  rating?: number;
  learners_count: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  last_updated: string; // ISO date string
}

export interface Unit {
  id: number;
  course_id: number;
  name: string;
  description: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface Module {
  id: number;
  unit_id: number;
  name: string;
  description: string;
  content: string; // JSON string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface ModuleQuestion {
  id: number;
  module_id: number;
  content: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface ModuleQuestionAnswer {
  id: number;
  question_id: number;
  content: string;
  is_correct: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface UserModuleSession {
  id: number;
  user_id: number;
  module_id: number;
  started_at: string; // ISO date string
  completed_at?: string; // ISO date string
  progress: number;
  current_position: number;
  last_accessed: string; // ISO date string
}

export interface UserAnswer {
  id: number;
  user_module_session_id: number;
  question_id: number;
  answer_id: number;
  answered_at: string; // ISO date string
  is_correct: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  achieved_at: string; // ISO date string
}

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  read: boolean;
  created_at: string; // ISO date string
}
