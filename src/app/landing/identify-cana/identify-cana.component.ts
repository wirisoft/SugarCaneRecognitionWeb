import { Component, inject } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosisService, ExtendedPredictionResult, SintomaDetail, PlagaDetail, VariedadDetail } from '../../services/diagnosis.service';
import Swal from 'sweetalert2';

// Interfaz para los resultados de detección adaptados
interface DetectionResult {
  id: number;
  imagen: string;
  originalFile: File;
  prediction?: ExtendedPredictionResult;
  isProcessing: boolean;
  error?: string;
  fecha: Date;
}

interface ProcessingOptions {
  enhanceContrast: boolean;
  location: string;
  notes: string;
  plantId: string;
  fieldSection: string;
}

@Component({
  selector: 'app-identify-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule, FormsModule],
  templateUrl: './identify-cana.component.html',
  styleUrl: './identify-cana.component.css'
})
export class IdentifyCanaComponent {
  private diagnosisService = inject(DiagnosisService);
  
  images: (string | null)[] = new Array(4).fill(null);
  imageFiles: (File | null)[] = new Array(4).fill(null);
  imageIndexes = [0, 1, 2, 3];
  isAnalyzing: boolean = false;
  analysisResults: DetectionResult[] = [];
  
  // Opciones de procesamiento
  processingOptions: ProcessingOptions = {
    enhanceContrast: false,
    location: '',
    notes: '',
    plantId: '',
    fieldSection: ''
  };

  // Estado de configuración avanzada
  showAdvancedOptions: boolean = false;
  useAdvancedProcessing: boolean = false;

  get hasImages(): boolean {
    return this.images.some(img => img !== null);
  }

  get isUserAuthenticated(): boolean {
    return this.diagnosisService.isUserAuthenticated();
  }

  get currentUser(): any {
    return this.diagnosisService.getCurrentUser();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const emptySlots = this.images.reduce((acc, curr, idx) => {
        if (curr === null) acc.push(idx);
        return acc;
      }, [] as number[]);

      files.slice(0, emptySlots.length).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const slotIndex = emptySlots[index];
          
          // Validar tamaño de archivo (máximo 10MB)
          if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
              icon: 'warning',
              title: 'Archivo muy grande',
              text: `El archivo ${file.name} es muy grande. El tamaño máximo permitido es 10MB.`
            });
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              this.images[slotIndex] = e.target.result as string;
              this.imageFiles[slotIndex] = file;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.images[index] = null;
    this.imageFiles[index] = null;
    
    // Remover resultado correspondiente si existe
    this.analysisResults = this.analysisResults.filter(result => result.id !== index);
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  async identify(): Promise<void> {
    if (!this.hasImages) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin imágenes',
        text: 'Por favor, agrega al menos una imagen para analizar.'
      });
      return;
    }

    // Verificar conexión con la API
    try {
      await this.diagnosisService.checkHealth().toPromise();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se puede conectar con el servidor. Verifica tu conexión a internet.'
      });
      return;
    }

    this.isAnalyzing = true;
    this.analysisResults = [];

    const selectedFiles = this.imageFiles.filter((file): file is File => file !== null);
    const selectedImages = this.images.filter((img): img is string => img !== null);

    // Crear resultados iniciales
    selectedFiles.forEach((file, index) => {
      this.analysisResults.push({
        id: index,
        imagen: selectedImages[index],
        originalFile: file,
        isProcessing: true,
        fecha: new Date()
      });
    });

    // Procesar cada imagen
    const processingPromises = selectedFiles.map((file, index) => 
      this.processImage(file, index)
    );

    try {
      await Promise.allSettled(processingPromises);
      
      // Mostrar resumen de resultados
      const successCount = this.analysisResults.filter(r => r.prediction && !r.error).length;
      const errorCount = this.analysisResults.filter(r => r.error).length;
      
      if (successCount > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Análisis completado',
          text: `Se analizaron ${successCount} imagen(es) exitosamente.${errorCount > 0 ? ` ${errorCount} imagen(es) tuvieron errores.` : ''}`
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en el análisis',
          text: 'No se pudo analizar ninguna imagen. Verifica que las imágenes sean válidas.'
        });
      }
    } catch (error) {
      console.error('Error durante el análisis:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ocurrió un error durante el análisis. Inténtalo de nuevo.'
      });
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async processImage(file: File, index: number): Promise<void> {
    try {
      const options = {
        enhanceContrast: this.useAdvancedProcessing ? this.processingOptions.enhanceContrast : undefined,
        location: this.processingOptions.location || undefined,
        notes: this.processingOptions.notes || undefined,
        plantId: this.processingOptions.plantId || undefined,
        fieldSection: this.processingOptions.fieldSection || undefined,
        deviceInfo: this.getDeviceInfo()
      };

      let prediction: ExtendedPredictionResult;

      if (this.useAdvancedProcessing) {
        prediction = await this.diagnosisService.advancedPredictDisease(file, options).toPromise() as ExtendedPredictionResult;
      } else {
        prediction = await this.diagnosisService.predictDisease(file, options).toPromise() as ExtendedPredictionResult;
      }

      // Actualizar resultado
      const resultIndex = this.analysisResults.findIndex(r => r.id === index);
      if (resultIndex !== -1) {
        this.analysisResults[resultIndex] = {
          ...this.analysisResults[resultIndex],
          prediction: prediction,
          isProcessing: false,
          error: undefined
        };
      }

    } catch (error: any) {
      console.error(`Error procesando imagen ${index}:`, error);
      
      // Actualizar resultado con error
      const resultIndex = this.analysisResults.findIndex(r => r.id === index);
      if (resultIndex !== -1) {
        this.analysisResults[resultIndex] = {
          ...this.analysisResults[resultIndex],
          isProcessing: false,
          error: this.getErrorMessage(error)
        };
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.detail) {
      return error.error.detail;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Error desconocido durante el procesamiento';
  }

  private getDeviceInfo(): string {
    return JSON.stringify({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    });
  }

  // Métodos helper para el template
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  }

  getConfidenceText(confidence: number): string {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  }

  getDamageColorClass(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'alto': return 'text-danger';
      case 'medio': return 'text-warning';
      case 'bajo': return 'text-success';
      default: return 'text-muted';
    }
  }

  // Métodos helper para estadísticas en template
  getSuccessfulResults(): DetectionResult[] {
    return this.analysisResults.filter(r => r.prediction && !r.error);
  }

  getSuccessfulCount(): number {
    return this.getSuccessfulResults().length;
  }

  getTotalCount(): number {
    return this.analysisResults.length;
  }

  // Método para obtener las predicciones como array ordenado
  getPredictionsArray(allPredictions: { [key: string]: number }): Array<{key: string, value: number}> {
    return Object.entries(allPredictions)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  // Método para ver detalles completos de la predicción
  showPredictionDetails(result: DetectionResult): void {
    if (!result.prediction) return;

    const prediction = result.prediction;
    let detailsHtml = `
      <div class="text-start">
        <h5>Detalles de la Predicción</h5>
        <p><strong>Clase:</strong> ${prediction.class_name}</p>
        <p><strong>ID de Clase:</strong> ${prediction.class_id}</p>
        <p><strong>Confianza:</strong> ${(prediction.confidence * 100).toFixed(2)}%</p>
        
        ${prediction.user_authenticated ? '<p><strong>Usuario autenticado:</strong> Sí</p>' : ''}
        ${prediction.history_id ? `<p><strong>ID de Historial:</strong> ${prediction.history_id}</p>` : ''}
        
        <h6 class="mt-3">Todas las predicciones:</h6>
        <ul class="list-unstyled">
    `;

    // Mostrar todas las predicciones ordenadas por confianza
    const allPredictions = Object.entries(prediction.all_predictions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5

    allPredictions.forEach(([className, confidence]) => {
      detailsHtml += `<li>${className}: ${(confidence * 100).toFixed(2)}%</li>`;
    });

    detailsHtml += `</ul></div>`;

    Swal.fire({
      title: 'Detalles de la Predicción',
      html: detailsHtml,
      width: '600px',
      confirmButtonText: 'Cerrar'
    });
  }

  // Método para descargar el resultado
  downloadResult(result: DetectionResult): void {
    if (!result.prediction) return;

    const data = {
      fecha: result.fecha,
      archivo: result.originalFile.name,
      prediccion: result.prediction,
      opciones_procesamiento: this.useAdvancedProcessing ? this.processingOptions : null
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultado_${result.prediction.class_name}_${new Date().getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Método para limpiar todos los resultados
  clearResults(): void {
    this.images = new Array(4).fill(null);
    this.imageFiles = new Array(4).fill(null);
    this.analysisResults = [];
  }
}