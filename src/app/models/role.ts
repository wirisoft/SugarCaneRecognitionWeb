import { RoleName } from "./RoleName";

export interface Role {
    id?: number;
    name: RoleName;
    description?: string;
    createdAt?: string;
    // Se omite la colección de usuarios para evitar ciclos.
  }
  