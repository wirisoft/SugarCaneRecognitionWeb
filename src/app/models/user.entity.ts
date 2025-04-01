// user.entity.ts (sin cambios)
import { Detection } from './detection';
import { Plant } from './plant';
import { Role } from './role';

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
}