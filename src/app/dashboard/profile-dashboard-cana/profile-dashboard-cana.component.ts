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
    RouterModule  // Add this import
  ],
  templateUrl: './profile-dashboard-cana.component.html',
  styleUrl: './profile-dashboard-cana.component.css'
})
export class ProfileDashboardCanaComponent implements OnInit {
  profileForm: FormGroup;
  profileImage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      location: ['', [Validators.required]],
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['', [Validators.minLength(6)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Here you would typically load the user's data
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Mock data - replace with actual API call
    const userData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(123) 456-7890',
      location: 'Ciudad de México, México',
      profileImage: 'assets/images/default-profile.png'
    };

    this.profileForm.patchValue(userData);
    this.profileImage = userData.profileImage;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Convert the file to a data URL for preview
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
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.value);
      // Here you would typically make an API call to update the profile
      // this.userService.updateProfile(this.profileForm.value).subscribe(...)
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
      if (control.errors['minlength']) return 'La contraseña debe tener al menos 6 caracteres';
      if (control.errors['mismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
