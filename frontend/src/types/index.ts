// ===== USER =====
export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  bio?: string;
  dailyReminderTime?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== AUTH =====
export interface LoginCredentials {
  usernameOrEmail: string; // frontend uses this, auth.ts converts to email
  password: string;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    user: User;
    token: string;
  };
}

// ===== API =====
export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}