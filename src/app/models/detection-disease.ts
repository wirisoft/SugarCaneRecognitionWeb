import { Detection } from "./detection";
import { Disease } from "./disease";

export interface DetectionDisease {
    id?: number;
    detection?: Detection;
    disease?: Disease;
    confidenceLevel?: number;
    detectionDetails?: string;
    createdAt?: string;
  }
  