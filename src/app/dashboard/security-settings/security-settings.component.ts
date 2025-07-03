// src/app/dashboard/security-settings/security-settings.component.ts (CORREGIDO)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// ✅ IMPORTACIONES CORREGIDAS - Desde los modelos directamente
import { TwoFactorSetupResponse, TwoFactorStatus } from '../../models/two-factor.model';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';
import { UserEntity } from '../../models/user.entity';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.css']
})
export class SecuritySettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado del componente
  currentUser: UserEntity | null = null;
  twoFactorStatus: TwoFactorStatus | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Configuración 2FA
  setupData: TwoFactorSetupResponse | null = null;
  showSetupModal = false;
  showDisableModal = false;
  showBackupCodesModal = false;

  // Formularios
  verificationCode = '';
  disableCode = '';
  backupCodeCode = '';
  newBackupCodes: string[] = [];

  // Estados de carga específicos
  loadingSetup = false;
  loadingEnable = false;
  loadingDisable = false;
  loadingBackupCodes = false;

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTwoFactorStatus();
    
    // Verificar si viene de registro con intención de configurar 2FA
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['setup2fa'] === 'true') {
        this.initializeTwoFactorSetup();
      }
    });

    // Verificar si hay preferencia guardada de habilitar 2FA después del login
    const enableAfterLogin = sessionStorage.getItem('enableTwoFactorAfterLogin');
    if (enableAfterLogin === 'true') {
      sessionStorage.removeItem('enableTwoFactorAfterLogin');
      this.initializeTwoFactorSetup();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser) {
      this.router.navigate(['/landing/login-cana']);
    }
  }

  loadTwoFactorStatus(): void {
    this.loading = true;
    this.twoFactorService.getTwoFactorStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          this.twoFactorStatus = status;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading 2FA status:', err);
          this.loading = false;
          // No mostrar error si el usuario no tiene 2FA configurado
          if (err.status !== 404) {
            this.errorMessage = 'Error al cargar el estado de 2FA';
          }
        }
      });
  }

  initializeTwoFactorSetup(): void {
    if (this.twoFactorStatus?.enabled) {
      this.errorMessage = '2FA ya está habilitado para tu cuenta';
      return;
    }

    this.loadingSetup = true;
    this.clearMessages();

    this.twoFactorService.setupTwoFactor()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.setupData = response;
          this.showSetupModal = true;
          this.loadingSetup = false;
          this.successMessage = 'Configuración de 2FA iniciada. Escanea el código QR con tu aplicación de autenticación.';
        },
        error: (err) => {
          this.loadingSetup = false;
          console.error('Error setting up 2FA:', err);
          this.errorMessage = err.error?.message || 'Error al configurar 2FA';
        }
      });
  }

  enableTwoFactor(): void {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.errorMessage = 'Ingresa un código de 6 dígitos válido';
      return;
    }

    this.loadingEnable = true;
    this.clearMessages();

    this.twoFactorService.enableTwoFactor(this.verificationCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingEnable = false;
          this.successMessage = 'Autenticación de dos factores habilitada exitosamente';
          this.showSetupModal = false;
          this.verificationCode = '';
          this.setupData = null;
          
          // Actualizar el usuario actual
          if (this.currentUser) {
            this.currentUser.twoFactorEnabled = true;
            this.authService.setUser(this.currentUser);
          }
          
          // Recargar estado
          this.loadTwoFactorStatus();
        },
        error: (err) => {
          this.loadingEnable = false;
          console.error('Error enabling 2FA:', err);
          this.errorMessage = err.error?.message || 'Código de verificación inválido';
        }
      });
  }

  disableTwoFactor(): void {
    if (!this.disableCode || this.disableCode.length !== 6) {
      this.errorMessage = 'Ingresa un código de 6 dígitos válido';
      return;
    }

    this.loadingDisable = true;
    this.clearMessages();

    this.twoFactorService.disableTwoFactor(this.disableCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingDisable = false;
          this.successMessage = 'Autenticación de dos factores deshabilitada';
          this.showDisableModal = false;
          this.disableCode = '';
          
          // Actualizar el usuario actual
          if (this.currentUser) {
            this.currentUser.twoFactorEnabled = false;
            this.authService.setUser(this.currentUser);
          }
          
          // Recargar estado
          this.loadTwoFactorStatus();
        },
        error: (err) => {
          this.loadingDisable = false;
          console.error('Error disabling 2FA:', err);
          this.errorMessage = err.error?.message || 'Código de verificación inválido';
        }
      });
  }

  regenerateBackupCodes(): void {
    if (!this.backupCodeCode || this.backupCodeCode.length !== 6) {
      this.errorMessage = 'Ingresa un código de 6 dígitos válido';
      return;
    }

    this.loadingBackupCodes = true;
    this.clearMessages();

    this.twoFactorService.regenerateBackupCodes(this.backupCodeCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingBackupCodes = false;
          this.newBackupCodes = response.backupCodes;
          this.successMessage = 'Códigos de respaldo regenerados exitosamente';
          this.backupCodeCode = '';
          
          // Recargar estado para actualizar el conteo
          this.loadTwoFactorStatus();
        },
        error: (err) => {
          this.loadingBackupCodes = false;
          console.error('Error regenerating backup codes:', err);
          this.errorMessage = err.error?.message || 'Error al regenerar códigos de respaldo';
        }
      });
  }

  // Métodos de utilidad
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeSetupModal(): void {
    this.showSetupModal = false;
    this.verificationCode = '';
    this.setupData = null;
    this.clearMessages();
  }

  closeDisableModal(): void {
    this.showDisableModal = false;
    this.disableCode = '';
    this.clearMessages();
  }

  closeBackupCodesModal(): void {
    this.showBackupCodesModal = false;
    this.backupCodeCode = '';
    this.newBackupCodes = [];
    this.clearMessages();
  }

  openDisableModal(): void {
    this.clearMessages();
    this.showDisableModal = true;
  }

  openBackupCodesModal(): void {
    this.clearMessages();
    this.showBackupCodesModal = true;
  }

  downloadBackupCodes(): void {
    if (this.newBackupCodes.length === 0) return;

    const content = `Códigos de Respaldo - Autenticación de Dos Factores\n` +
                   `Usuario: ${this.currentUser?.email}\n` +
                   `Generados: ${new Date().toLocaleString()}\n\n` +
                   `IMPORTANTE: Guarda estos códigos en un lugar seguro.\n` +
                   `Cada código solo puede usarse una vez.\n\n` +
                   this.newBackupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-codes-${this.currentUser?.email}-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Copiado al portapapeles';
      setTimeout(() => this.clearMessages(), 3000);
    }).catch(() => {
      this.errorMessage = 'Error al copiar al portapapeles';
    });
  }

  // Validación de códigos
  isValidCode(code: string): boolean {
    return code.length === 6 && /^\d{6}$/.test(code);
  }

  onCodeInput(event: any, type: 'verification' | 'disable' | 'backup'): void {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    
    switch (type) {
      case 'verification':
        this.verificationCode = value;
        break;
      case 'disable':
        this.disableCode = value;
        break;
      case 'backup':
        this.backupCodeCode = value;
        break;
    }
  }
}