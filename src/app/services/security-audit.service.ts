// security-audit.service.ts - Servicio específico para auditorías
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecurityAuditEntity, AuditSearchParams } from '../models/user-security.model';

@Injectable({
  providedIn: 'root'
})
export class SecurityAuditService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('sessionToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Obtener todas las auditorías
  getAllAudits(): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/get-all`, {
      headers: this.getHeaders()
    }).pipe(
      map(audits => {
        console.log('📋 Todas las auditorías:', audits);
        return audits;
      }),
      catchError(error => {
        console.error('Error obteniendo auditorías:', error);
        return of([]);
      })
    );
  }

  // Obtener auditoría por ID
  getAuditById(id: number): Observable<SecurityAuditEntity | null> {
    return this.http.get<SecurityAuditEntity>(`${this.apiUrl}/security-audits/get/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo auditoría:', error);
        return of(null);
      })
    );
  }

  // Buscar auditorías con filtros
  searchAudits(params: AuditSearchParams): Observable<SecurityAuditEntity[]> {
    let httpParams = new HttpParams();
    
    if (params.userId) httpParams = httpParams.append('userId', params.userId.toString());
    if (params.eventType) httpParams = httpParams.append('eventType', params.eventType);
    if (params.ipAddress) httpParams = httpParams.append('ipAddress', params.ipAddress);
    if (params.startDate) httpParams = httpParams.append('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.append('endDate', params.endDate);
    if (params.severity) httpParams = httpParams.append('severity', params.severity);
    if (params.limit) httpParams = httpParams.append('limit', params.limit.toString());

    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/search`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(audits => {
        console.log('🔍 Auditorías encontradas:', audits);
        return audits;
      }),
      catchError(error => {
        console.error('Error buscando auditorías:', error);
        return of([]);
      })
    );
  }

  // Obtener auditorías por usuario
  getAuditsByUser(userId: number): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/user/${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo auditorías del usuario:', error);
        return of([]);
      })
    );
  }

  // Obtener auditorías por tipo de evento
  getAuditsByEventType(eventType: string): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/event-type/${eventType}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo auditorías por tipo:', error);
        return of([]);
      })
    );
  }

  // Obtener auditorías por severidad
  getAuditsBySeverity(severity: string): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/severity/${severity}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo auditorías por severidad:', error);
        return of([]);
      })
    );
  }

  // Obtener auditorías por IP
  getAuditsByIpAddress(ipAddress: string): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(`${this.apiUrl}/security-audits/ip/${ipAddress}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo auditorías por IP:', error);
        return of([]);
      })
    );
  }

  // Obtener estadísticas de eventos
  getEventStatistics(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/security-audits/statistics`, {
      headers: this.getHeaders()
    }).pipe(
      map(stats => {
        console.log('📊 Estadísticas de eventos:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error obteniendo estadísticas:', error);
        return of({});
      })
    );
  }

  // Obtener intentos de login fallidos por IP
  getFailedLoginsByIp(ipAddress: string, hours: number = 24): Observable<SecurityAuditEntity[]> {
    return this.http.get<SecurityAuditEntity[]>(
      `${this.apiUrl}/security-audits/failed-logins/${ipAddress}?hours=${hours}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error obteniendo intentos fallidos:', error);
        return of([]);
      })
    );
  }

  // Limpiar auditorías antiguas
  cleanOldAudits(daysToKeep: number = 90): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/security-audits/cleanup?daysToKeep=${daysToKeep}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('🧹 Limpieza completada:', response);
        return response;
      })
    );
  }

  // Crear auditoría manual (para casos especiales)
  createAudit(audit: Partial<SecurityAuditEntity>): Observable<SecurityAuditEntity> {
    return this.http.post<SecurityAuditEntity>(
      `${this.apiUrl}/security-audits/create`,
      audit,
      { headers: this.getHeaders() }
    ).pipe(
      map(newAudit => {
        console.log('✅ Auditoría creada:', newAudit);
        return newAudit;
      })
    );
  }

  // Métodos de utilidad para formatear tipos de eventos
  getEventTypeLabel(eventType: string): string {
    const labels: Record<string, string> = {
      'LOGIN_SUCCESS': 'Inicio de sesión exitoso',
      'LOGIN_FAILED': 'Intento de login fallido',
      'ACCOUNT_LOCKED': 'Cuenta bloqueada',
      'ACCOUNT_UNLOCKED_BY_ADMIN': 'Cuenta desbloqueada',
      '2FA_ENABLED': '2FA habilitado',
      '2FA_DISABLED': '2FA deshabilitado',
      'PASSWORD_CHANGED': 'Contraseña cambiada',
      'PASSWORD_CHANGE_FAILED': 'Cambio de contraseña fallido',
      'USER_CREATED_BY_ADMIN': 'Usuario creado',
      'USER_UPDATED_BY_ADMIN': 'Usuario actualizado',
      'USER_DELETED_BY_ADMIN': 'Usuario eliminado',
      'USER_PARTIAL_UPDATE_BY_ADMIN': 'Actualización parcial'
    };
    return labels[eventType] || eventType;
  }

  // Obtener color por severidad
  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'LOW': 'text-info',
      'MEDIUM': 'text-warning',
      'HIGH': 'text-danger',
      'CRITICAL': 'text-danger fw-bold'
    };
    return colors[severity] || 'text-secondary';
  }

  // Obtener icono por tipo de evento
  getEventTypeIcon(eventType: string): string {
    const icons: Record<string, string> = {
      'LOGIN_SUCCESS': 'bi-box-arrow-in-right',
      'LOGIN_FAILED': 'bi-x-circle',
      'ACCOUNT_LOCKED': 'bi-lock',
      'ACCOUNT_UNLOCKED_BY_ADMIN': 'bi-unlock',
      '2FA_ENABLED': 'bi-shield-check',
      '2FA_DISABLED': 'bi-shield-x',
      'PASSWORD_CHANGED': 'bi-key',
      'PASSWORD_CHANGE_FAILED': 'bi-key',
      'USER_CREATED_BY_ADMIN': 'bi-person-plus',
      'USER_UPDATED_BY_ADMIN': 'bi-pencil',
      'USER_DELETED_BY_ADMIN': 'bi-trash',
      'USER_PARTIAL_UPDATE_BY_ADMIN': 'bi-pencil-square'
    };
    return icons[eventType] || 'bi-info-circle';
  }
}