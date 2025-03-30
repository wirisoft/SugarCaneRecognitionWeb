import { Detection } from "./detection";
import { Disease } from "./disease";
import { Pest } from "./pest";
import { UserEntity } from "./user.entity";

export interface Plant {
    id?: number;
    commonName: string;
    scientificName?: string;
    description?: string;
    image?: string;
    imageName?: string;
    imageType?: string;
    createdAt?: string;
    updatedAt?: string;
    diseases?: Disease[];  // Relación con enfermedades
    pests?: Pest[];        // Relación con plagas
    detections?: Detection[];  // Detecciones asociadas
    createdBy?: UserEntity;      // Usuario que creó la planta
  }
  