// src/app/services/diagnosis.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interfaces existentes (mantenemos las que ya tienes)
export interface SintomaDetail {
  id_sintoma: number;
  nombre: string;
  descripcion: string;
}

export interface PlagaDetail {
  nombre_comun: string;
  nombre_cientifico: string;
  descripcion: string;
  nivel_danio: string;
  temporada_comun: string;
  sintomas: SintomaDetail[];
}

export interface VariedadDetail {
  id_variedad: number;
  nombre: string;
  codigo: string;
  caracteristicas: string;
  planta_id: number;
}

// Interfaz actualizada para incluir información de usuario
export interface ExtendedPredictionResult {
  class_id: number;
  class_name: string;
  confidence: number;
  all_predictions: { [key: string]: number };
  history_id?: string; // ID del historial en MongoDB
  user_authenticated: boolean; // Si el usuario está autenticado
  user_info?: any; // Información del usuario si está autenticado
  plaga_info?: PlagaDetail | null; // Información de la plaga
  variedad_info?: VariedadDetail | null; // Información de la variedad
}

// Interfaces para el historial de detecciones
export interface DetectionHistory {
  id: string;
  timestamp: string;
  prediction: {
    class_id: number;
    class_name: string;
    confidence: number;
    all_predictions: { [key: string]: number };
  };
  processing_info: any;
  user_info: any;
  metadata: any;
  has_image: boolean;
}

export interface UserStatistics {
  user_id: number;
  user_info: any;
  total_detections: number;
  detections_by_class: Array<{
    _id: string;
    count: number;
    avg_confidence: number;
    last_detection: string;
    locations: string[];
  }>;
  recent_activity_last_7_days: Array<{
    _id: string;
    count: number;
    classes_detected: string[];
  }>;
  most_common_location?: string;
  summary: {
    total_classes_detected: number;
    most_detected_class?: string;
    avg_confidence_overall: number;
  };
  last_updated: string;
}

export interface ErrorResponse {
  detail: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private apiUrl = 'http://localhost:8001';

  constructor(private http: HttpClient) { }

  // Métodos helper para obtener información del usuario
  private getUserInfo(): any {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
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

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    const token = this.getToken();
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Método actualizado para predicción simple con información de usuario
  predictDisease(
    imageFile: File, 
    options: {
      location?: string;
      deviceInfo?: string;
    } = {}
  ): Observable<ExtendedPredictionResult> {
    const formData = new FormData();
    formData.append('file', imageFile);

    // Agregar información del usuario si está disponible
    const userInfo = this.getUserInfo();
    if (userInfo) {
      formData.append('user_info', JSON.stringify(userInfo));
    }

    // Agregar información adicional
    if (options.location) {
      formData.append('location', options.location);
    }

    // Agregar información del dispositivo
    formData.append('device_info', options.deviceInfo || this.getDeviceInfo());

    return this.http.post<ExtendedPredictionResult>(
      `${this.apiUrl}/predict`, 
      formData, 
      { headers: this.getHeaders() }
    );
  }

  // Método actualizado para predicción avanzada con información de usuario
  advancedPredictDisease(
    imageFile: File, 
    options: {
      enhanceContrast?: boolean;
      location?: string;
      notes?: string;
      plantId?: string;
      fieldSection?: string;
    } = {}
  ): Observable<ExtendedPredictionResult> {
    const formData = new FormData();
    formData.append('file', imageFile);

    // Agregar información del usuario si está disponible
    const userInfo = this.getUserInfo();
    if (userInfo) {
      formData.append('user_info', JSON.stringify(userInfo));
    }

    // Agregar información adicional
    if (options.location) {
      formData.append('location', options.location);
    }

    if (options.notes) {
      formData.append('notes', options.notes);
    }

    if (options.plantId) {
      formData.append('plant_id', options.plantId);
    }

    if (options.fieldSection) {
      formData.append('field_section', options.fieldSection);
    }

    // Agregar información del dispositivo
    formData.append('device_info', this.getDeviceInfo());

    // Configurar parámetros
    let params = new HttpParams();
    if (options.enhanceContrast !== undefined) {
      params = params.set('enhance_contrast', options.enhanceContrast.toString());
    }

    return this.http.post<ExtendedPredictionResult>(
      `${this.apiUrl}/advanced-predict`, 
      formData, 
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // Método para obtener vista previa (sin cambios)
  getProcessedImagePreview(
    imageFile: File, 
    stage: string, 
    useAdvanced: boolean = true
  ): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', imageFile);
    const params = { 
      stage: stage, 
      use_advanced: useAdvanced.toString() 
    };
    return this.http.post(`${this.apiUrl}/preview`, formData, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Método para verificar salud de la API (sin cambios)
  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/healthcheck`);
  }

  // NUEVOS MÉTODOS PARA HISTORIAL DE DETECCIONES

  // Obtener detecciones recientes del usuario actual
  getCurrentUserDetections(limit: number = 50, classFilter?: string): Observable<DetectionHistory[]> {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.id) {
      throw new Error('Usuario no autenticado');
    }

    let params = new HttpParams().set('limit', limit.toString());
    if (classFilter) {
      params = params.set('class_filter', classFilter);
    }

    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/history/user/${userInfo.id}`, { 
      params,
      headers: this.getHeaders() 
    });
  }

  // Obtener estadísticas del usuario actual
  getCurrentUserStatistics(): Observable<UserStatistics> {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.id) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.get<UserStatistics>(`${this.apiUrl}/history/user/${userInfo.id}/statistics`, {
      headers: this.getHeaders()
    });
  }

  // Obtener detecciones recientes (todas)
  getRecentDetections(limit: number = 10): Observable<DetectionHistory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/history/recent`, { 
      params,
      headers: this.getHeaders() 
    });
  }

  // Obtener estadísticas generales
  getGeneralStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/statistics`, {
      headers: this.getHeaders()
    });
  }

  // Obtener detección específica
  getDetection(detectionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/${detectionId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener imagen de una detección
  getDetectionImage(detectionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/history/${detectionId}/image`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  // Obtener detecciones filtradas por clase
  getDetectionsByClass(className: string, limit: number = 50): Observable<DetectionHistory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/history/by-class/${className}`, {
      params,
      headers: this.getHeaders()
    });
  }

  // Verificar estado del servicio de historial
  checkHistoryHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/health/check`);
  }

  // MÉTODOS PARA ADMINISTRADORES

  // Obtener detecciones de un usuario específico (para admins)
  getUserDetections(userId: number, limit: number = 50): Observable<DetectionHistory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/history/user/${userId}`, {
      params,
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas de un usuario específico (para admins)
  getUserStatistics(userId: number): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(`${this.apiUrl}/history/user/${userId}/statistics`, {
      headers: this.getHeaders()
    });
  }

  // Obtener resumen de todos los usuarios (para admins)
  getUsersSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/users/summary`, {
      headers: this.getHeaders()
    });
  }

  // Obtener solo detecciones autenticadas (para admins)
  getAuthenticatedDetections(limit: number = 50, roleFilter?: string): Observable<DetectionHistory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (roleFilter) {
      params = params.set('role_filter', roleFilter);
    }

    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/history/authenticated`, {
      params,
      headers: this.getHeaders()
    });
  }

  // MÉTODOS HELPER

  // Verificar si el usuario está autenticado
  isUserAuthenticated(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo !== null && userInfo.id !== undefined;
  }

  // Obtener información del usuario actual
  getCurrentUser(): any {
    return this.getUserInfo();
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(roleName: string): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.roles) {
      return false;
    }
    
    return userInfo.roles.some((role: any) => role.name === roleName);
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}