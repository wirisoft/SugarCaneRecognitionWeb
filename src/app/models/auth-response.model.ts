// src/app/models/auth-response.model.ts (CORREGIDO)
import { UserEntity } from './user.entity';

export interface LoginResponse {
  jwt?: string;
  sessionToken?: string;
  user?: UserEntity;
  sessionExpires?: string;
  needsPasswordChange?: boolean;
  
  // Propiedades para 2FA
  requires2FA?: boolean;
  tempToken?: string;
  email?: string;
  message?: string;
  
  // ✅ AGREGADO: Propiedad faltante para twoFactorEnabled
  twoFactorEnabled?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserEntity;
}

// ✅ AGREGADO: Interface para respuesta de registro
export interface RegisterResponse {
  success?: boolean;
  message?: string;
  user?: UserEntity;
  errors?: string[];
  // ✅ AGREGADO: Propiedad faltante para numOfErrors
  numOfErrors?: number;
  data?: any;
}