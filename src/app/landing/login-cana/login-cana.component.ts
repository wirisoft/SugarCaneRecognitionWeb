// src/app/components/login-cana/login-cana.component.ts (CORREGIDO)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-cana',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavBarCanaComponent,
    FooterCanaComponent
  ],
  templateUrl: './login-cana.component.html',
  styleUrls: ['./login-cana.component.css']
})
export class LoginCanaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del formulario
  loginData = {
    email: '',
    password: ''
  };

  // Estado del componente
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  rememberMe = false;

  // Propiedades para 2FA - AGREGADAS PARA CORREGIR LOS ERRORES
  requires2FA = false;
  twoFactorCode = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ya está autenticado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard/dashboard-home']);
      return;
    }

    // Limpiar cualquier estado de 2FA anterior
    this.authService.cancel2FAProcess();
    this.requires2FA = false;
    this.twoFactorCode = '';

    // Cargar email recordado si existe
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.rememberMe = true;
    }

    // Suscribirse a cambios en el estado de 2FA
    this.authService.requires2FA$
      .pipe(takeUntil(this.destroy$))
      .subscribe(requires2FA => {
        this.requires2FA = requires2FA;
        if (requires2FA) {
          // Mostrar sección de 2FA en el mismo componente
          this.clearMessages();
          this.successMessage = 'Revisa tu aplicación de autenticación para el código de verificación';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loading) return;

    // Validar formulario
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    // Manejar "recordar email"
    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', this.loginData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    console.log('🔐 Intentando login para:', this.loginData.email);

    this.authService.login(this.loginData.email, this.loginData.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response.requires2FA) {
            // El usuario tiene 2FA habilitado
            console.log('🔐 Se requiere verificación 2FA');
            this.requires2FA = true;
            this.successMessage = 'Revisa tu aplicación de autenticación para el código de verificación';
            // Limpiar contraseña por seguridad
            this.loginData.password = '';
          } else {
            // Login exitoso sin 2FA
            console.log('✅ Login exitoso sin 2FA');
            this.successMessage = 'Inicio de sesión exitoso. Redirigiendo...';
            // La redirección se maneja automáticamente en AuthService
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error en login:', err);
          
          // Manejar diferentes tipos de errores
          if (err.status === 401) {
            this.errorMessage = 'Email o contraseña incorrectos';
          } else if (err.status === 403) {
            this.errorMessage = 'Cuenta bloqueada. Contacta al administrador';
          } else if (err.status === 404) {
            this.errorMessage = 'Usuario no encontrado';
          } else if (err.status === 429) {
            this.errorMessage = 'Demasiados intentos de login. Espera unos minutos';
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Error de conexión. Por favor, intenta nuevamente';
          }
          
          // Limpiar contraseña en caso de error
          this.loginData.password = '';
        }
      });
  }

  // MÉTODO AGREGADO PARA MANEJAR INPUT DE CÓDIGO 2FA
  onCodeInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    this.twoFactorCode = value;
    this.clearMessages();
  }

  // MÉTODO AGREGADO PARA VERIFICAR CÓDIGO 2FA
  verify2FACode(): void {
    if (this.loading) return;

    if (!this.twoFactorCode || this.twoFactorCode.length !== 6) {
      this.errorMessage = 'Por favor ingresa un código de 6 dígitos válido';
      return;
    }

    this.loading = true;
    this.clearMessages();

    console.log('🔐 Verificando código 2FA');

    this.authService.verify2FALogin(this.twoFactorCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('✅ Verificación 2FA exitosa');
          this.successMessage = 'Verificación exitosa. Redirigiendo...';
          // El AuthService maneja automáticamente la redirección
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error en verificación 2FA:', err);
          
          if (err.status === 401 || err.status === 400) {
            this.errorMessage = 'Código de verificación inválido. Intenta nuevamente.';
          } else if (err.status === 403) {
            this.errorMessage = 'Token de verificación expirado. Por favor, inicia sesión nuevamente.';
            setTimeout(() => {
              this.cancel2FA();
            }, 2000);
          } else {
            this.errorMessage = 'Error de conexión. Por favor, intenta nuevamente.';
          }
          
          // Limpiar código después de error
          this.twoFactorCode = '';
        }
      });
  }

  // MÉTODO AGREGADO PARA CANCELAR 2FA
  cancel2FA(): void {
    this.requires2FA = false;
    this.twoFactorCode = '';
    this.clearMessages();
    this.authService.cancel2FAProcess();
  }

  validateForm(): boolean {
    this.clearMessages();

    if (!this.loginData.email) {
      this.errorMessage = 'Por favor ingresa tu email';
      return false;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return false;
    }

    if (!this.loginData.password) {
      this.errorMessage = 'Por favor ingresa tu contraseña';
      return false;
    }

    if (this.loginData.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return false;
    }

    return true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para manejar "Olvidé mi contraseña"
  forgotPassword(): void {
    if (!this.loginData.email) {
      this.errorMessage = 'Por favor ingresa tu email primero';
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    // Aquí podrías implementar la lógica de recuperación de contraseña
    this.successMessage = 'Se enviaron instrucciones de recuperación a tu email';
    console.log('🔑 Solicitud de recuperación de contraseña para:', this.loginData.email);
  }

  // Método para navegación a registro
  goToRegister(): void {
    this.router.navigate(['/landing/register-cana']);
  }
}