// register-cana.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule, FormsModule],
  templateUrl: './register-cana.component.html',
  styleUrls: ['./register-cana.component.css']
})
export class RegisterCanaComponent {
  // Datos de registro que se vinculan al formulario
  registerData = {
    email: '',
    password: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: ''
  };

  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loading) return;
    
    // Validación básica de formulario
    if (!this.registerData.email || !this.registerData.password || 
        !this.registerData.nombre || !this.registerData.apellidoPaterno) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }
    
    // Resetear mensajes de error
    this.errorMessage = '';
    this.loading = true;
    
    console.log('Intento de registro con:', this.registerData);
    
    // Mapear los datos del formulario a lo que espera RegisterUserDTO en el backend
    const newUser = {
      email: this.registerData.email,
      password: this.registerData.password,
      firstName: this.registerData.nombre,
      middleName: this.registerData.apellidoMaterno,
      lastName: this.registerData.apellidoPaterno,
      phoneNumber: this.registerData.telefono
    };

    // Llamada al servicio de registro
    this.authService.register(newUser)
      .subscribe({
        next: (response) => {
          console.log('Respuesta de registro exitosa:', response);
          this.loading = false;
          alert('Usuario registrado correctamente. Por favor inicie sesión.');
          this.router.navigate(['/landing/login-cana']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en registro:', err);
          
          // Extraer mensaje de error del backend
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Error al registrar el usuario. Por favor intente nuevamente.';
          }
          
          // También mostrar alerta
          alert(this.errorMessage);
        }
      });
  }
}