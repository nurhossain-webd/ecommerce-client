import type { AuthSession, LoginInput, RegisterInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

export const authApi = {
  login: (body: LoginInput, options?: RequestOptions) =>
    apiRequest<AuthSession, LoginInput>("/api/auth/login", { ...options, method: "POST", body }),
  register: (body: RegisterInput, options?: RequestOptions) =>
    apiRequest<AuthSession, RegisterInput>("/api/auth/register", { ...options, method: "POST", body }),
};
