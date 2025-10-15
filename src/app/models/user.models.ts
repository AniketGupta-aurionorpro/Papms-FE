import { Role } from "./auth.models";

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: number;
  isActive: boolean;
  requiresPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
}
