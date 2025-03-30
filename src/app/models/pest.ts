import { DetectionPest } from "./detection-pest";
import { Plant } from "./plant";

export interface Pest {
    id?: number;
    commonName: string;
    scientificName?: string;
    description?: string;
    damageLevel?: string;
    commonSeason?: string;
    preventionMethods?: string;
    controlMethods?: string;
    image?: string;
    imageName?: string;
    imageType?: string;
    createdAt?: string;
    updatedAt?: string;
    plants?: Plant[];          // Relación con plantas (opcional)
    detectionPests?: DetectionPest[];
  }
  