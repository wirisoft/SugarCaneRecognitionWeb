// src/app/services/two-factor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  TwoFactorSetupResponse, 
  TwoFactorStatus, 
  TwoFactorVerifyRequest,
  TwoFactorEnableRequest,
  TwoFactorDisableRequest,
  BackupCodeRegenerateRequest,
  BackupCodeRegenerateResponse
} from '../models/two-factor.model';

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  private apiUrl = 'http://localhost:8080/two-factor';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('sessionToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Configurar 2FA para el usuario actual
  setupTwoFactor(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(
      `${this.apiUrl}/setup`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Habilitar 2FA con código de verificación
  enableTwoFactor(code: string): Observable<any> {
    const request: TwoFactorEnableRequest = { code };
    return this.http.post<any>(
      `${this.apiUrl}/enable`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Deshabilitar 2FA con código de verificación
  disableTwoFactor(code: string): Observable<any> {
    const request: TwoFactorDisableRequest = { code };
    return this.http.post<any>(
      `${this.apiUrl}/disable`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Verificar código 2FA
  verifyTwoFactorCode(code: string): Observable<any> {
    const request: TwoFactorVerifyRequest = { code };
    return this.http.post<any>(
      `${this.apiUrl}/verify`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Obtener estado actual de 2FA
  getTwoFactorStatus(): Observable<TwoFactorStatus> {
    return this.http.get<TwoFactorStatus>(
      `${this.apiUrl}/status`,
      { headers: this.getHeaders() }
    );
  }

  // Regenerar códigos de respaldo
  regenerateBackupCodes(code: string): Observable<BackupCodeRegenerateResponse> {
    const request: BackupCodeRegenerateRequest = { code };
    return this.http.post<BackupCodeRegenerateResponse>(
      `${this.apiUrl}/regenerate-backup-codes`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Métodos administrativos (requieren rol ADMIN)
  getAllTwoFactors(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/get-all`,
      { headers: this.getHeaders() }
    );
  }

  getTwoFactorById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/get/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getTwoFactorByUserId(userId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  getTwoFactorStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/statistics`,
      { headers: this.getHeaders() }
    );
  }

  forceDisableTwoFactor(userId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/force-disable/${userId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteTwoFactor(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.getHeaders() }
    );
  }

  regenerateQRCode(userId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/qr-code/${userId}`,
      { headers: this.getHeaders() }
    );
  }
}