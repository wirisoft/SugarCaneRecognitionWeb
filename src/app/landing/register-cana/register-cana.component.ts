// src/app/components/register-cana/register-cana.component.ts (Actualizado)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { AuthService } from '../../services/auth.service';
import { PasswordValidationService } from '../../services/password-validation.service';
import { PasswordStrength } from '../../models/password-validation.model';
import { RegisterFormData } from '../../models/register.model';

@Component({
  selector: 'app-register-cana',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavBarCanaComponent,
    FooterCanaComponent
  ],
  templateUrl: './register-cana.component.html',
  styleUrls: ['./register-cana.component.css']
})
export class RegisterCanaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del formulario
  registerData: RegisterFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    acceptTerms: false,
    enableTwoFactor: false
  };

  // Estado del formulario
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  
  // Validación de contraseña
  passwordStrength: PasswordStrength = this.getDefaultPasswordStrength();
  passwordTouched = false;
  confirmPasswordTouched = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private passwordValidationService: PasswordValidationService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ya está autenticado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard/dashboard-home']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Validación de contraseña en tiempo real
  onPasswordChange(): void {
    if (this.registerData.password) {
      // Validación local inmediata
      this.passwordStrength = this.passwordValidationService.validatePasswordLocally(this.registerData.password);
      
      // También validar con el servidor (opcional, para estadísticas)
      this.passwordValidationService.validatePassword(this.registerData.password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (serverStrength) => {
            console.log('Validación del servidor:', serverStrength);
            if (serverStrength.errors && serverStrength.errors.length > 0) {
              this.passwordStrength.errors = serverStrength.errors;
            }
          },
          error: (err) => {
            console.error('Error validando contraseña con el servidor:', err);
          }
        });
    } else {
      this.passwordStrength = this.getDefaultPasswordStrength();
    }
  }

  // Validación antes de enviar el formulario
  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.registerData.email || !this.isValidEmail(this.registerData.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return false;
    }

    if (!this.passwordStrength.meetsAllRequirements) {
      this.errorMessage = 'La contraseña debe cumplir TODOS los requisitos: ' +
        '8-16 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
      return false;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    if (!this.registerData.firstName || this.registerData.firstName.trim().length < 3) {
      this.errorMessage = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }

    if (this.registerData.firstName.trim().length > 15) {
      this.errorMessage = 'El nombre no debe exceder 15 caracteres';
      return false;
    }

    if (!this.registerData.lastName || this.registerData.lastName.trim().length < 3) {
      this.errorMessage = 'El apellido debe tener al menos 3 caracteres';
      return false;
    }

    if (this.registerData.lastName.trim().length > 30) {
      this.errorMessage = 'El apellido no debe exceder 30 caracteres';
      return false;
    }

    if (this.registerData.phoneNumber && !this.isValidPhone(this.registerData.phoneNumber)) {
      this.errorMessage = 'Por favor ingresa un número de teléfono válido';
      return false;
    }

    if (!this.registerData.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (this.loading) return;

    this.passwordTouched = true;
    this.confirmPasswordTouched = true;

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Preparar datos para el backend
    const userData = {
      email: this.registerData.email.trim().toLowerCase(),
      password: this.registerData.password,
      firstName: this.registerData.firstName.trim(),
      middleName: this.registerData.middleName?.trim() || null,
      lastName: this.registerData.lastName.trim(),
      phoneNumber: this.registerData.phoneNumber?.trim() || null,
      isActive: true,
      twoFactorEnabled: false // Siempre false al registrar
    };

    console.log('📤 Enviando datos de registro:', { ...userData, password: '***' });

    // Si el usuario marcó habilitar 2FA, guardamos esa preferencia
    if (this.registerData.enableTwoFactor) {
      this.authService.setEnable2FAAfterLogin(true);
    }

    // Llamar al servicio de registro
    this.authService.register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('✅ Registro exitoso:', response);
          
          this.successMessage = 'Registro exitoso. Iniciando sesión...';
          
          // El AuthService maneja automáticamente el login y redirección
          // Si enableTwoFactor está marcado, redirigirá a security-settings
          // Si no, redirigirá al dashboard
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error en registro:', err);
          
          if (err.status === 409) {
            this.errorMessage = 'El email ya está registrado';
          } else if (err.status === 400) {
            if (err.error?.message) {
              this.errorMessage = err.error.message;
            } else if (err.error?.error) {
              this.errorMessage = err.error.error;
            } else {
              this.errorMessage = 'Los datos ingresados no son válidos';
            }
          } else {
            this.errorMessage = 'Error al registrar. Por favor intenta nuevamente';
          }
        }
      });
  }

  // Métodos de utilidad
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  private getDefaultPasswordStrength(): PasswordStrength {
    return {
      score: 0,
      strengthText: 'Muy Débil',
      strengthLevel: 'very-weak',
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      hasMinLength: false,
      hasMaxLength: true,
      suggestions: [],
      estimatedCrackTime: 'Instantáneo',
      meetsAllRequirements: false,
      isValid: false
    };
  }

  generatePassword(): void {
    const newPassword = this.passwordValidationService.generateSecurePassword();
    this.registerData.password = newPassword;
    this.registerData.confirmPassword = newPassword;
    this.onPasswordChange();
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
  }

  get passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.confirmPassword;
  }

  get showConfirmError(): boolean {
    return this.confirmPasswordTouched && !this.passwordsMatch && this.registerData.confirmPassword !== '';
  }
}