import { UserService } from '../../services/user.service';
import { UserEntity } from '../../models/user.entity';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


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
export class ProfileDashboardCanaComponent implements OnInit {
  profileForm: FormGroup;
  profileImage: string | null = null;
  currentUser: UserEntity | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      middleName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]],
      phoneNumber: [''],
      currentPassword: [''], // Opcional si solo actualizas perfil sin cambiar contraseña
      newPassword: ['', [
        Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,16}$')
      ]],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  

  ngOnInit() {
    // Cargar datos del usuario desde el servicio de autenticación
    this.loadUserProfile();
    
    // Suscribirse a cambios en el usuario
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.updateFormWithUserData(user);
      }
    });
  }

  // Modifica el método loadUserProfile
  loadUserProfile() {
    // Obtener el usuario actual del servicio
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.updateFormWithUserData(this.currentUser);
    }
  }

  updateFormWithUserData(user: UserEntity) {
    // Actualizar el formulario con los datos del usuario
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
      // Convertir el archivo a data URL (base64)
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
  
      // Verificar si se está intentando cambiar la contraseña
      if (formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword) {
        // Crear objeto de usuario actualizado que incluye la contraseña
        const updatedUser: Partial<UserEntity> = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.newPassword, // Incluir la nueva contraseña
          profileImage: this.profileImage || undefined// Usar this.profileImage en lugar de formData.profileImage
        };
        
        // Actualizar el usuario usando el método existente
        this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
          next: (updatedUser) => {
            // Actualizar el usuario en el servicio de autenticación
            this.authService.setUser(updatedUser);
            // Mostrar mensaje de éxito
            alert('Perfil actualizado correctamente');
          },
          error: (err) => {
            // Manejar errores
            console.error('Error al actualizar el perfil:', err);
            alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
          }
        });
      } else if (!formData.newPassword && !formData.confirmPassword) {
        // Si no se está cambiando la contraseña, actualizar solo los otros datos
        const updatedUser: Partial<UserEntity> = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          profileImage: this.profileImage || undefined // Usar this.profileImage en lugar de formData.profileImage
        };
        
        this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
          next: (updatedUser) => {
            this.authService.setUser(updatedUser);
            alert('Perfil actualizado correctamente');
          },
          error: (err) => {
            console.error('Error al actualizar el perfil:', err);
            alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
          }
        });
      } else {
        // Si hay campos de contraseña pero no coinciden o son inválidos
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

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Helper method to get error message
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
    
    // Verificar si hay error de coincidencia de contraseñas
    if (fieldName === 'confirmPassword' && this.profileForm.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }
}