// services/session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:8080/sessions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Validar si la sesión actual es válida
  validateSession(): Observable<{ valid: boolean, expiresAt?: string, lastActivity?: string }> {
    return this.http.post<{ valid: boolean, expiresAt?: string, lastActivity?: string }>(
      `${this.apiUrl}/validate`, 
      {}
    );
  }

  // Cerrar sesión actual
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`, 
      {}
    );
  }

  // Cerrar todas las sesiones del usuario
  logoutAll(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout-all`, 
      { userId }
    );
  }

  // Para administradores: obtener todas las sesiones
  getAllSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all`);
  }

  // Para administradores: obtener sesiones activas de un usuario
  getActiveSessionsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Para administradores: invalidar una sesión específica
  invalidateSession(sessionId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/invalidate/${sessionId}`, 
      {}
    );
  }
}