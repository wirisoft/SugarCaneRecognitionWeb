// user.entity.ts (sin cambios)
import { Detection } from './detection';
import { Plant } from './plant';
import { Role } from './role';

// Actualiza tu user.entity.ts agregando estos campos:
export interface UserEntity {
  id?: number;
  email: string;
  password?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: Role[];
  detections?: Detection[];
  plants?: Plant[];
  profileImage?: string;
  
  // Nuevos campos de seguridad
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  accountLocked?: boolean;
  passwordChangedAt?: string;
  forcePasswordChange?: boolean;
}