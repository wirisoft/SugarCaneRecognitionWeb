import { Detection } from "./detection";

export interface DetectionImage {
    id?: number;
    detection?: Detection;
    imagePath: string;
    imageName?: string;
    imageType?: string;
    // Si prefieres trabajar con imágenes en base64, puedes convertir el arreglo de bytes a una cadena:
    imageData?: string;
    uploadedAt?: string;
  }
  