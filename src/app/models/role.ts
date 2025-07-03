// src/app/models/role.ts
import { RoleName } from './RoleName';

export interface Role {
  id?: number;
  name: RoleName;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id?: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}