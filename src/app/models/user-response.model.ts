// src/app/models/user-response.model.ts (CREAR ESTE ARCHIVO)
import { UserEntity } from './user.entity';

// Interface específica para respuestas del UserService
export interface UserUpdateResponse {
  user?: UserEntity;
  message?: string;
  success?: boolean;
  errors?: string[];
}

// Interface para respuesta de perfil de usuario
export interface UserProfileResponse {
  user?: UserEntity;
  success?: boolean;
  message?: string;
}

// Interface para respuesta de creación de usuario
export interface UserCreateResponse {
  user: UserEntity;
  message: string;
  success: boolean;
}

// Interface para respuestas generales del UserService
export interface UserServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  user?: UserEntity;
}

// Interface para paginación de usuarios
export interface UserPaginationResponse {
  users: UserEntity[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}