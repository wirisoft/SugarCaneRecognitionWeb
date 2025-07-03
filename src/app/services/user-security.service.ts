// user-security.service.ts 
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  UserSecurityEntity,
  UserSecurityOverview,
  SecurityStatistics,
  UserSecurityFilters,
  UserSecurityResponse,
  UserAuditResponse
} from '../models/user-security.model';

@Injectable({
  providedIn: 'root'
})
export class UserSecurityService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('sessionToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Obtener todos los usuarios con información de seguridad
  getUsersWithSecurity(filters?: UserSecurityFilters): Observable<UserSecurityResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.append('search', filters.search);
      if (filters.page !== undefined) params = params.append('page', filters.page.toString());
      if (filters.size !== undefined) params = params.append('size', filters.size.toString());
      if (filters.roleFilter) params = params.append('roleFilter', filters.roleFilter);
      if (filters.statusFilter) params = params.append('statusFilter', filters.statusFilter);
      if (filters.activityFilter) params = params.append('activityFilter', filters.activityFilter);
    }

    // Primero intenta el endpoint con seguridad, si no existe usa el básico
    return this.http.get<UserSecurityResponse>(`${this.apiUrl}/users/get-all-with-security`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError((error) => {
        console.log('⚠️ Endpoint con seguridad no disponible, usando endpoint básico');
        // Fallback al endpoint básico
        return this.http.get<any>(`${this.apiUrl}/users/get-all`, {
          headers: this.getHeaders(),
          params
        }).pipe(
          map(response => this.transformBasicResponse(response))
        );
      }),
      map(response => {
        console.log('📊 Usuarios con seguridad cargados:', response);
        return response;
      })
    );
  }

  // Transformar respuesta básica a respuesta con seguridad
  private transformBasicResponse(response: any): UserSecurityResponse {
    const users = response.users || response || [];
    return {
      users: users.map((user: any) => ({
        ...user,
        accountLocked: this.calculateAccountLocked(user),
        needsPasswordChange: this.calculateNeedsPasswordChange(user),
        activeSessions: 0
      })),
      totalElements: response.totalElements || users.length,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || 0
    };
  }

  // Obtener resumen de seguridad de un usuario
  getUserSecurityOverview(userId: number): Observable<UserSecurityOverview> {
    return this.http.get<UserSecurityOverview>(`${this.apiUrl}/users/security-overview/${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(overview => {
        console.log('🔒 Resumen de seguridad del usuario:', overview);
        return overview;
      }),
      catchError((error) => {
        console.error('Error obteniendo resumen de seguridad:', error);
        // Devolver datos por defecto si el endpoint no está disponible
        return of({
          userId,
          email: '',
          isActive: true,
          accountLocked: false,
          failedLoginAttempts: 0,
          needsPasswordChange: false,
          twoFactorEnabled: false,
          activeSessions: 0
        });
      })
    );
  }

  // Obtener estadísticas de seguridad
  getSecurityStatistics(): Observable<SecurityStatistics> {
    return this.http.get<SecurityStatistics>(`${this.apiUrl}/users/security-statistics`, {
      headers: this.getHeaders()
    }).pipe(
      map(stats => {
        console.log('📈 Estadísticas de seguridad:', stats);
        return stats;
      }),
      catchError((error) => {
        console.error('Error obteniendo estadísticas:', error);
        // Calcular estadísticas localmente si el endpoint no está disponible
        return this.calculateLocalStatistics();
      })
    );
  }

  // Calcular estadísticas localmente como fallback
  private calculateLocalStatistics(): Observable<SecurityStatistics> {
    return this.getUsersWithSecurity().pipe(
      map(response => {
        const users = response.users;
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        
        return {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive && !u.accountLocked).length,
          lockedUsers: users.filter(u => u.accountLocked).length,
          twoFactorEnabledUsers: users.filter(u => u.twoFactorEnabled).length,
          onlineUsers: users.filter(u => {
            if (!u.lastLogin) return false;
            const lastLogin = new Date(u.lastLogin);
            return lastLogin > twoHoursAgo;
          }).length
        };
      })
    );
  }

  // Obtener auditorías de seguridad de un usuario
  getUserSecurityAudits(userId: number, limit: number = 50): Observable<UserAuditResponse> {
    return this.http.get<UserAuditResponse>(`${this.apiUrl}/users/security-audit/${userId}?limit=${limit}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('📋 Auditorías del usuario:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error obteniendo auditorías:', error);
        return of({
          userId,
          email: '',
          audits: [],
          totalAudits: 0
        });
      })
    );
  }

  // Desbloquear usuario
  unlockUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/unlock-user/${userId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('🔓 Usuario desbloqueado:', response);
        return response;
      })
    );
  }

  // Métodos auxiliares para calcular estados
  private calculateAccountLocked(user: any): boolean {
    if (user.accountLocked !== undefined) return user.accountLocked;
    if (!user.accountLockedUntil) return false;
    const lockedUntil = new Date(user.accountLockedUntil);
    return lockedUntil > new Date();
  }

  private calculateNeedsPasswordChange(user: any): boolean {
    if (user.needsPasswordChange !== undefined) return user.needsPasswordChange;
    if (user.forcePasswordChange) return true;
    if (!user.passwordChangedAt) return false;
    
    const changedAt = new Date(user.passwordChangedAt);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return changedAt < ninetyDaysAgo;
  }

  // Actualizar parcialmente información de seguridad
  updateUserSecurity(userId: number, updates: Partial<UserSecurityEntity>): Observable<UserSecurityEntity> {
    return this.http.patch<any>(`${this.apiUrl}/users/update-partial/${userId}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Seguridad actualizada:', response);
        return response.user || response;
      })
    );
  }

  // Forzar cambio de contraseña
  forcePasswordChange(userId: number, force: boolean = true): Observable<any> {
    return this.updateUserSecurity(userId, { forcePasswordChange: force });
  }

  // Habilitar/Deshabilitar 2FA
  toggle2FA(userId: number, enabled: boolean): Observable<any> {
    return this.updateUserSecurity(userId, { twoFactorEnabled: enabled });
  }

  // Resetear intentos fallidos
  resetFailedAttempts(userId: number): Observable<any> {
    return this.updateUserSecurity(userId, { 
      failedLoginAttempts: 0,
      accountLockedUntil: null as any
    });
  }
}