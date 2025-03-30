import { Detection } from "./detection";
import { Pest } from "./pest";

export interface DetectionPest {
    id?: number;
    detection?: Detection;
    pest?: Pest;
    confidenceLevel?: number;
    detectionDetails?: string;
    createdAt?: string;
  }
  