import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule,
    FormsModule],
  templateUrl: './register-cana.component.html',
  styleUrl: './register-cana.component.css'
})
export class RegisterCanaComponent {
  registerData = {
    email: '',
    password: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('Register attempt with:', this.registerData);
    
    // Mapeo de la data ingresada a la interfaz UserEntity
    const newUser = {
      email: this.registerData.email,
      password: this.registerData.password,
      firstName: this.registerData.nombre,
      // Puedes optar por concatenar apellido paterno y materno o asignarlos por separado
      lastName: `${this.registerData.apellidoPaterno} ${this.registerData.apellidoMaterno}`,
      phoneNumber: this.registerData.telefono
    };

    // Llamada al servicio de registro
    this.authService.register(newUser)
      .subscribe({
        next: (response) => {
          // Manejo de la respuesta, redirigir o informar al usuario
          alert('Usuario registrado correctamente.');
          // Opcional: redirigir a login o directamente al dashboard
          this.router.navigate(['/landing/login-cana']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          alert('Error al registrar el usuario.');
        }
      });
  }
  
}
