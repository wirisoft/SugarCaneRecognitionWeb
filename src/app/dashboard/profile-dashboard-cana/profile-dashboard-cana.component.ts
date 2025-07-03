// src/app/dashboard/profile-dashboard-cana/profile-dashboard-cana.component.ts (VERSIÓN ESTABLE CON 2FA)
import { UserService } from '../../services/user.service';
import { TwoFactorService } from '../../services/two-factor.service';
import { UserEntity } from '../../models/user.entity';
import { TwoFactorStatus } from '../../models/two-factor.model';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './profile-dashboard-cana.component.html',
  styleUrl: './profile-dashboard-cana.component.css'
})
export class ProfileDashboardCanaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm: FormGroup;
  profileImage: string | null = null;
  currentUser: UserEntity | null = null;
  
  // ✅ PROPIEDADES 2FA AGREGADAS
  twoFactorStatus: TwoFactorStatus | null = null;
  loadingTwoFactor = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private twoFactorService: TwoFactorService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      middleName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]],
      phoneNumber: [''],
      currentPassword: [''],
      newPassword: ['', [
        Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,16}$')
      ]],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadTwoFactorStatus();
    
    // Suscribirse a cambios en el usuario
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.updateFormWithUserData(user);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ MÉTODO PARA CARGAR ESTADO 2FA
  loadTwoFactorStatus() {
    this.loadingTwoFactor = true;
    this.twoFactorService.getTwoFactorStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          this.twoFactorStatus = status;
          this.loadingTwoFactor = false;
          console.log('🔒 Estado 2FA cargado:', status);
        },
        error: (err) => {
          this.loadingTwoFactor = false;
          if (err.status === 404) {
            this.twoFactorStatus = { enabled: false };
            console.log('🔒 Usuario sin 2FA configurado');
          } else {
            console.error('❌ Error cargando estado 2FA:', err);
          }
        }
      });
  }

  // ✅ MÉTODO PARA CONFIGURAR 2FA
  setupTwoFactor() {
    console.log('🔧 Navegando a configuración de seguridad para configurar 2FA');
    this.router.navigate(['/dashboard/security-settings'], {
      queryParams: { setup2fa: 'true' }
    });
  }

  // ✅ MÉTODO PARA GESTIONAR 2FA
  manageTwoFactor() {
    console.log('🔧 Navegando a configuración de seguridad');
    this.router.navigate(['/dashboard/security-settings']);
  }

  loadUserProfile() {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.updateFormWithUserData(this.currentUser);
    }
  }

  updateFormWithUserData(user: UserEntity) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    });
    
    this.profileImage = user.profileImage || null;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB permitido');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.profileForm.valid && this.currentUser?.id) {
      const formData = this.profileForm.value;
  
      if (formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword) {
        const updatedUser: Partial<UserEntity> = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.newPassword,
          profileImage: this.profileImage || undefined
        };
        
        this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
          next: (updatedUserResponse: UserEntity) => {
            // ✅ CORREGIDO: El UserService ya devuelve directamente UserEntity
            this.authService.setUser(updatedUserResponse);
            this.loadTwoFactorStatus();
            alert('Perfil actualizado correctamente');
            
            this.profileForm.patchValue({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          },
          error: (err) => {
            console.error('Error al actualizar el perfil:', err);
            alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
          }
        });
      } else if (!formData.newPassword && !formData.confirmPassword) {
        const updatedUser: Partial<UserEntity> = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          profileImage: this.profileImage || undefined
        };
        
        this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
          next: (updatedUserResponse: UserEntity) => {
            // ✅ CORREGIDO: El UserService ya devuelve directamente UserEntity
            this.authService.setUser(updatedUserResponse);
            this.loadTwoFactorStatus();
            alert('Perfil actualizado correctamente');
          },
          error: (err) => {
            console.error('Error al actualizar el perfil:', err);
            alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
          }
        });
      } else {
        alert('Las contraseñas no coinciden o no cumplen con los requisitos');
      }
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['email']) return 'Correo electrónico inválido';
      if (control.errors['pattern']) {
        if (fieldName === 'email') return 'Formato de correo electrónico inválido';
        if (fieldName === 'newPassword') 
          return 'La contraseña debe tener entre 8 y 16 caracteres, al menos un número, una minúscula y una mayúscula';
      }
      if (control.errors['minlength']) {
        if (fieldName === 'firstName' || fieldName === 'middleName') 
          return 'Debe tener al menos 3 caracteres';
        return 'Debe tener al menos ' + control.errors['minlength'].requiredLength + ' caracteres';
      }
      if (control.errors['maxlength']) {
        if (fieldName === 'firstName') return 'No debe exceder los 15 caracteres';
        if (fieldName === 'middleName') return 'No debe exceder los 30 caracteres';
        return 'No debe exceder los ' + control.errors['maxlength'].requiredLength + ' caracteres';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.profileForm.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }
}