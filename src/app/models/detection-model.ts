export interface DetectionModel {
    id?: number;
    name: string;
    version: string;
    description?: string;
    modelData?: string;
    trainingDate?: string; // ISO string
    precisionMetric?: number;
    type: string; // Ej.: "DISEASE", "PEST" o "BOTH" (se puede usar un enum)
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Se omite la lista de detections para evitar ciclos en la serialización.
  }
  