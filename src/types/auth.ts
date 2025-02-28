import { User } from "@prisma/client";

export type AuthUser = User & {
  role: "USER" | "ADMIN" | "ORGANIZATION";
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordCredentials {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  error?: string;
}
