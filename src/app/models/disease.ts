import { DetectionDisease } from "./detection-disease";
import { Plant } from "./plant";

export interface Disease {
    id?: number;
    name: string;
    scientificName?: string;
    description?: string;
    symptoms?: string;
    preventionMethods?: string;
    treatmentMethods?: string;
    image?: string;      // Imagen codificada en base64 (según tu implementación)
    imageName?: string;
    imageType?: string;
    createdAt?: string;
    updatedAt?: string;
    plants?: Plant[];    // Relación con plantas (opcional)
    detectionDiseases?: DetectionDisease[];
  }
  