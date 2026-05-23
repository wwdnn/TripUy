export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionData {
  user: AuthUser;
  session: AuthSession;
}

export type AuthProvider = "credential" | "google";

export interface SignInEmailInput {
  email: string;
  password: string;
}

export interface SignUpEmailInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInSocialInput {
  provider: AuthProvider;
  callbackURL?: string;
}

export interface AuthResult<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}
