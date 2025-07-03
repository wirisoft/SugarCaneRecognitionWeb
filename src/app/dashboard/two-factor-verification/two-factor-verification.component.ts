// src/app/dashboard/two-factor-verification/two-factor-verification.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="verification-container">
      <div class="verification-card">
        <div class="text-center mb-4">
          <div class="verification-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h2 class="mb-3">Verificación de Dos Factores</h2>
          <p class="text-muted">
            Ingresa el código de 6 dígitos de tu aplicación de autenticación
          </p>
          <small class="text-muted d-block">
            Usuario: <strong>{{ userEmail }}</strong>
          </small>
        </div>

        <!-- Mensajes -->
        <div *ngIf="errorMessage" class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="alert alert-success">
          <i class="fas fa-check-circle me-2"></i>
          {{ successMessage }}
        </div>

        <!-- Formulario de verificación -->
        <form (ngSubmit)="verify2FA()" class="verification-form">
          <div class="mb-4">
            <label class="form-label">Código de verificación</label>
            <input 
              type="text" 
              class="form-control code-input"
              placeholder="000000"
              maxlength="6"
              [(ngModel)]="verificationCode"
              (input)="onCodeInput($event)"
              [class.is-invalid]="verificationCode && !isValidCode(verificationCode)"
              name="verificationCode"
              required
              autofocus
              [disabled]="loading">
            <small class="form-text text-muted">
              Código de 6 dígitos de Google Authenticator, Microsoft Authenticator o similar
            </small>
          </div>

          <!-- Opciones adicionales -->
          <div class="mb-4">
            <button 
              type="button" 
              class="btn btn-link p-0 text-decoration-none"
              (click)="showBackupCodeInput = !showBackupCodeInput"
              [disabled]="loading">
              <i class="fas fa-key me-2"></i>
              ¿No tienes acceso a tu aplicación? Usar código de respaldo
            </button>
          </div>

          <!-- Input para código de respaldo -->
          <div *ngIf="showBackupCodeInput" class="mb-4">
            <label class="form-label">Código de respaldo</label>
            <input 
              type="text" 
              class="form-control"
              placeholder="Código de respaldo de 6 dígitos"
              [(ngModel)]="backupCode"
              name="backupCode"
              maxlength="6"
              [disabled]="loading">
            <small class="form-text text-muted">
              Usa uno de los códigos de respaldo que guardaste al configurar 2FA
            </small>
          </div>

          <!-- Botones -->
          <div class="d-grid gap-2">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg"
              [disabled]="(!isValidCode(verificationCode) && !isValidCode(backupCode)) || loading">
              <span *ngIf="!loading">
                <i class="fas fa-sign-in-alt me-2"></i>
                Verificar e Ingresar
              </span>
              <span *ngIf="loading">
                <i class="fas fa-spinner fa-spin me-2"></i>
                Verificando...
              </span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-outline-secondary"
              (click)="cancelVerification()"
              [disabled]="loading">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Login
            </button>
          </div>
        </form>

        <!-- Información adicional -->
        <div class="info-section mt-4">
          <div class="help-text">
            <h6>¿Necesitas ayuda?</h6>
            <ul class="help-list">
              <li>Asegúrate de que la hora en tu dispositivo sea correcta</li>
              <li>Verifica que estás usando el código más reciente</li>
              <li>Si perdiste tu dispositivo, usa un código de respaldo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f2fbf3 0%, #95e0a1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .verification-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 500px;
    }

    .verification-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1a472a, #95e0a1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white;
      font-size: 2rem;
    }

    .code-input {
      text-align: center;
      font-size: 1.5rem;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5rem;
      font-weight: bold;
      padding: 1rem;
      border-radius: 12px;
    }

    .code-input:focus {
      border-color: #1a472a;
      box-shadow: 0 0 0 0.2rem rgba(26, 71, 42, 0.25);
    }

    .btn-primary {
      background: linear-gradient(135deg, #1a472a, #95e0a1);
      border: none;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(26, 71, 42, 0.3);
    }

    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 500;
    }

    .btn-outline-secondary:hover {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }

    .btn-link {
      color: #1a472a;
      font-size: 0.9rem;
    }

    .btn-link:hover {
      color: #95e0a1;
    }

    .alert {
      border-radius: 12px;
      border: none;
      padding: 1rem 1.5rem;
    }

    .info-section {
      border-top: 1px solid #e9ecef;
      padding-top: 1.5rem;
    }

    .help-text h6 {
      color: #495057;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .help-list {
      padding-left: 1.25rem;
      margin: 0;
    }

    .help-list li {
      color: #6c757d;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 576px) {
      .verification-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .code-input {
        font-size: 1.25rem;
        letter-spacing: 0.3rem;
      }
    }
  `]
})
export class TwoFactorVerificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  verificationCode = '';
  backupCode = '';
  showBackupCodeInput = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está en el flujo de 2FA
    if (!this.authService.isWaitingFor2FA) {
      this.router.navigate(['/landing/login-cana']);
      return;
    }

    this.userEmail = this.authService.tempAuthEmail || '';
    
    // Si no hay email temporal, redirigir al login
    if (!this.userEmail) {
      this.router.navigate(['/landing/login-cana']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCodeInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    this.verificationCode = value;
    this.clearError();
  }

  verify2FA(): void {
    if (this.loading) return;

    const codeToVerify = this.verificationCode || this.backupCode;
    
    if (!this.isValidCode(codeToVerify)) {
      this.errorMessage = 'Por favor ingresa un código de 6 dígitos válido';
      return;
    }

    this.loading = true;
    this.clearError();

    this.authService.verify2FALogin(codeToVerify)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          // El AuthService maneja automáticamente la redirección
          console.log('✅ Verificación 2FA exitosa');
          this.successMessage = 'Verificación exitosa. Redirigiendo...';
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error en verificación 2FA:', err);
          
          if (err.status === 401 || err.status === 400) {
            this.errorMessage = 'Código de verificación inválido. Intenta nuevamente.';
          } else if (err.status === 403) {
            this.errorMessage = 'Token de verificación expirado. Por favor, inicia sesión nuevamente.';
            setTimeout(() => {
              this.cancelVerification();
            }, 2000);
          } else {
            this.errorMessage = 'Error de conexión. Por favor, intenta nuevamente.';
          }
          
          // Limpiar códigos después de error
          this.verificationCode = '';
          this.backupCode = '';
        }
      });
  }

  cancelVerification(): void {
    this.authService.cancel2FAProcess();
  }

  isValidCode(code: string): boolean {
    return typeof code === 'string' && code.length === 6 && /^\d{6}$/.test(code);
  }

  private clearError(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}