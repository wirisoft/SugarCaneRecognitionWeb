import { DetectionDisease } from "./detection-disease";
import { DetectionModel } from "./detection-model";
import { Plant } from "./plant";
import { UserEntity } from "./user.entity";

export interface Detection {
    id?: number;
    name: string;
    scientificName?: string;
    description?: string;
    symptoms?: string;
    preventionMethods?: string;
    treatmentMethods?: string;
    createdAt?: string; // ISO string, ej. "2025-03-30T12:34:56Z"
    updatedAt?: string;
    plant?: Plant;
    model?: DetectionModel;
    user?: UserEntity;
    detectionDiseases?: DetectionDisease[];
    // Si se requieren, se pueden agregar arrays para detectionHistory, detectionImages o detectionPests.
  }
  