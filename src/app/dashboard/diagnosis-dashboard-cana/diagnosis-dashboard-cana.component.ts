// src/app/dashboard/diagnosis-dashboard-cana/diagnosis-dashboard-cana.component.ts

import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { FormsModule } from '@angular/forms';
import { DiagnosisService, ExtendedPredictionResult, UserStatistics, DetectionHistory } from '../../services/diagnosis.service';

// Interface actualizada para mostrar resultados con información de usuario
interface AnalysisResultDisplay {
  id: number;
  imagen: string; // Base64 de la imagen para mostrarla
  confianza: number;
  plaga: {
    nombre_comun: string;
    nombre_cientifico?: string;
    descripcion?: string;
    nivel_danio?: string;
    temporada_comun?: string;
  };
  variedad: {
    nombre: string;
    codigo?: string;
    caracteristicas?: string;
  };
  sintomas: {
    id_sintoma: number;
    nombre: string;
    descripcion: string;
  }[];
  fecha: Date;
  history_id?: string; // ID del historial en MongoDB
  user_authenticated: boolean;
  apiPredictionResult: ExtendedPredictionResult; // Para guardar el resultado crudo de la API
}

@Component({
  selector: 'app-diagnosis-dashboard-cana',
  standalone: true,
  imports: [CommonModule, NavBarDashboardCanaComponent, FormsModule],
  templateUrl: './diagnosis-dashboard-cana.component.html',
  styleUrl: './diagnosis-dashboard-cana.component.css'
})
export class DiagnosisDashboardCanaComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  images: (File | null)[] = new Array(4).fill(null);
  imagePreviews: (string | null)[] = new Array(4).fill(null);
  imageIndexes = [0, 1, 2, 3];

  isAnalyzing: boolean = false;
  analysisResults: AnalysisResultDisplay[] = [];
  errorMessage: string | null = null;
  previewImageUrl: string | null = null;

  // Nuevas propiedades para información de usuario
  userInfo: any = null;
  userStats: UserStatistics | null = null;
  recentDetections: DetectionHistory[] = [];
  showUserInfo: boolean = true;

  // Opciones de análisis
  analysisOptions = {
    location: '',
    notes: '',
    plantId: '',
    fieldSection: '',
    enhanceContrast: true
  };

  constructor(private diagnosisService: DiagnosisService) { }

  ngOnInit() {
    this.loadUserInfo();
    this.loadUserStatistics();
    this.loadRecentDetections();
  }

  // Métodos para cargar información del usuario
  loadUserInfo() {
    if (this.diagnosisService.isUserAuthenticated()) {
      this.userInfo = this.diagnosisService.getCurrentUser();
      console.log('Usuario autenticado:', this.userInfo);
    } else {
      console.log('Usuario no autenticado - modo anónimo');
    }
  }

  async loadUserStatistics() {
    if (!this.diagnosisService.isUserAuthenticated()) return;

    try {
      // CORRECIÓN: Manejar el caso undefined explícitamente
      const stats = await this.diagnosisService.getCurrentUserStatistics().toPromise();
      this.userStats = stats || null;
      console.log('Estadísticas del usuario:', this.userStats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      this.userStats = null;
    }
  }

  async loadRecentDetections() {
    if (!this.diagnosisService.isUserAuthenticated()) return;

    try {
      // CORRECIÓN: Manejar el caso undefined explícitamente
      const detections = await this.diagnosisService.getCurrentUserDetections(5).toPromise();
      this.recentDetections = detections || [];
      console.log('Detecciones recientes:', this.recentDetections);
    } catch (error) {
      console.error('Error al cargar detecciones recientes:', error);
      this.recentDetections = [];
    }
  }

  get hasImages(): boolean {
    return this.images.some(img => img !== null);
  }

  get isUserAuthenticated(): boolean {
    return this.diagnosisService.isUserAuthenticated();
  }

  get isAdmin(): boolean {
    return this.diagnosisService.isAdmin();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      let fileIndex = 0;

      for (let i = 0; i < this.images.length && fileIndex < files.length; i++) {
        if (this.images[i] === null) {
          const file = files[fileIndex];
          if (file.type.startsWith('image/')) {
            this.images[i] = file;

            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                this.imagePreviews[i] = e.target.result as string;
              }
            };
            reader.readAsDataURL(file);
            fileIndex++;
          }
        }
      }
      this.analysisResults = [];
      this.errorMessage = null;
    }
  }

  removeImage(index: number): void {
    this.images[index] = null;
    this.imagePreviews[index] = null;
    this.analysisResults = this.analysisResults.filter(result => result.id !== index);
  }

  identify(): void {
    const filesToAnalyze = this.images.filter((img): img is File => img !== null);

    if (filesToAnalyze.length === 0) {
      this.errorMessage = 'Por favor, selecciona al menos una imagen para analizar.';
      return;
    }

    this.isAnalyzing = true;
    this.analysisResults = [];
    this.errorMessage = null;

    let completedRequests = 0;
    const totalRequests = filesToAnalyze.length;

    filesToAnalyze.forEach((file, originalIndex) => {
      // Usar método avanzado con opciones de análisis
      this.diagnosisService.advancedPredictDisease(file, {
        enhanceContrast: this.analysisOptions.enhanceContrast,
        location: this.analysisOptions.location || undefined,
        notes: this.analysisOptions.notes || undefined,
        plantId: this.analysisOptions.plantId || undefined,
        fieldSection: this.analysisOptions.fieldSection || undefined
      }).subscribe({
        next: (apiResult: ExtendedPredictionResult) => {
          console.log('Resultado de la API:', apiResult);

          const displayResult: AnalysisResultDisplay = {
            id: originalIndex,
            imagen: this.imagePreviews[originalIndex]!,
            confianza: apiResult.confidence,
            plaga: {
              nombre_comun: apiResult.plaga_info?.nombre_comun || apiResult.class_name,
              nombre_cientifico: apiResult.plaga_info?.nombre_cientifico,
              descripcion: apiResult.plaga_info?.descripcion,
              nivel_danio: apiResult.plaga_info?.nivel_danio,
              temporada_comun: apiResult.plaga_info?.temporada_comun,
            },
            variedad: {
              nombre: apiResult.variedad_info?.nombre || 'Desconocida',
              codigo: apiResult.variedad_info?.codigo,
              caracteristicas: apiResult.variedad_info?.caracteristicas,
            },
            sintomas: apiResult.plaga_info?.sintomas || [],
            fecha: new Date(),
            history_id: apiResult.history_id,
            user_authenticated: apiResult.user_authenticated,
            apiPredictionResult: apiResult
          };

          this.analysisResults.push(displayResult);
          
          // Mostrar información de guardado
          if (apiResult.history_id) {
            console.log(`Detección guardada en historial con ID: ${apiResult.history_id}`);
            if (apiResult.user_authenticated) {
              console.log('Detección asociada al usuario autenticado');
            } else {
              console.log('Detección guardada como usuario anónimo');
            }
          }
          
          completedRequests++;
          if (completedRequests === totalRequests) {
            this.isAnalyzing = false;
            this.analysisResults.sort((a, b) => b.confianza - a.confianza);
            
            // Recargar estadísticas y detecciones si el usuario está autenticado
            if (this.isUserAuthenticated) {
              this.loadUserStatistics();
              this.loadRecentDetections();
            }
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.detail || `Error al procesar la imagen ${originalIndex + 1}.`;
          console.error(`Error al predecir para imagen ${originalIndex + 1}:`, err);
          completedRequests++;
          if (completedRequests === totalRequests) {
            this.isAnalyzing = false;
          }
        }
      });
    });
  }

  getPreview(index: number): void {
    const fileToPreview = this.images[index];
    if (!fileToPreview) {
      this.errorMessage = 'No hay imagen seleccionada en este slot para previsualizar.';
      return;
    }

    this.diagnosisService.getProcessedImagePreview(fileToPreview, 'enhanced').subscribe({
      next: (blob: Blob) => {
        this.previewImageUrl = URL.createObjectURL(blob);
        console.log('Previsualización obtenida.');
      },
      error: (err) => {
        this.errorMessage = 'Error al obtener la previsualización.';
        console.error('Error al previsualizar:', err);
      }
    });
  }

  // Nuevos métodos para manejar el historial

  async viewDetectionHistory() {
    if (!this.isUserAuthenticated) {
      this.errorMessage = 'Debes estar logueado para ver tu historial.';
      return;
    }

    try {
      const history = await this.diagnosisService.getCurrentUserDetections(20).toPromise();
      console.log('Historial completo:', history || []);
      // Aquí podrías mostrar el historial en un modal o navegar a otra página
    } catch (error) {
      console.error('Error al obtener historial:', error);
      this.errorMessage = 'Error al cargar el historial de detecciones.';
    }
  }

  async viewDetectionImage(historyId: string) {
    try {
      const imageBlob = await this.diagnosisService.getDetectionImage(historyId).toPromise();
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        // Mostrar imagen en modal o nueva ventana
        window.open(imageUrl, '_blank');
      }
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      this.errorMessage = 'Error al cargar la imagen del historial.';
    }
  }

  async refreshUserData() {
    if (this.isUserAuthenticated) {
      await this.loadUserStatistics();
      await this.loadRecentDetections();
    }
  }

  // Métodos de utilidad para la UI

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  }

  getDiseaseColor(className: string): string {
    if (className.includes('healthy')) return 'success';
    return 'danger';
  }

  getDamageLevelColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'alto': return 'danger';
      case 'medio': return 'warning';
      case 'bajo': return 'success';
      default: return 'secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearResults() {
    this.analysisResults = [];
    this.errorMessage = null;
  }

  toggleUserInfo() {
    this.showUserInfo = !this.showUserInfo;
  }

  // src/app/dashboard/diagnosis-dashboard-cana/diagnosis-dashboard-cana.component.ts
// AGREGAR ESTOS MÉTODOS HELPER AL FINAL DE TU CLASE COMPONENTE (antes del último })

  // Métodos helper para el template
  getSavedResultsCount(): number {
    return this.analysisResults.filter(r => r.history_id).length;
  }

  getTotalResultsCount(): number {
    return this.analysisResults.length;
  }

  // Métodos para conversiones seguras de datos
  getConfidencePercentage(confidence: number): string {
    return (confidence * 100).toFixed(1);
  }

  // Métodos para valores con fallback
  getScientificName(result: AnalysisResultDisplay): string {
    return result.plaga.nombre_cientifico || 'No disponible';
  }

  getDamageLevel(result: AnalysisResultDisplay): string {
    return result.plaga.nivel_danio || 'No especificado';
  }

  getSeasonInfo(result: AnalysisResultDisplay): string {
    return result.plaga.temporada_comun || 'Todo el año';
  }

  getVarietyCode(result: AnalysisResultDisplay): string | undefined {
    return result.variedad.codigo;
  }

  getVarietyCharacteristics(result: AnalysisResultDisplay): string | undefined {
    return result.variedad.caracteristicas;
  }

  hasDescription(result: AnalysisResultDisplay): boolean {
    return !!result.plaga.descripcion;
  }

  hasVarietyCode(result: AnalysisResultDisplay): boolean {
    return !!result.variedad.codigo;
  }

  hasVarietyCharacteristics(result: AnalysisResultDisplay): boolean {
    return !!result.variedad.caracteristicas;
  }

  hasSymptomsData(result: AnalysisResultDisplay): boolean {
    return result.sintomas && result.sintomas.length > 0;
  }

  // Métodos para detecciones recientes
  getDetectionLocation(detection: DetectionHistory): string {
    return detection.user_info?.location || '-';
  }

  getDetectionConfidencePercentage(detection: DetectionHistory): string {
    return (detection.prediction.confidence * 100).toFixed(1);
  }

}