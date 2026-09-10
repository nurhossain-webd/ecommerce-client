import type { AuthSession, GoogleLoginInput, LoginInput, RegisterInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

export const authApi = {
  login: (body: LoginInput, options?: RequestOptions) =>
    apiRequest<AuthSession, LoginInput>("/api/auth/login", { ...options, method: "POST", body }),
  register: (body: RegisterInput, options?: RequestOptions) =>
    apiRequest<AuthSession, RegisterInput>("/api/auth/register", { ...options, method: "POST", body }),
  google: (body: GoogleLoginInput, options?: RequestOptions) =>
    apiRequest<AuthSession, GoogleLoginInput>("/api/auth/google", { ...options, method: "POST", body }),
};
