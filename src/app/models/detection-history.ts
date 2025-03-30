import { Detection } from "./detection";
import { UserEntity } from "./user.entity";

export interface DetectionHistory {
    id?: number;
    detection?: Detection;
    status: string;
    comments?: string;
    user?: UserEntity;
    createdAt?: string;
  }
  