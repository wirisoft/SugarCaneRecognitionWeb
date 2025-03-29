import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent,
    FormsModule,
    CommonModule],
  templateUrl: './login-cana.component.html',
  styleUrl: './login-cana.component.css'
})
export class LoginCanaComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    // Llamada al servicio de login
    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (response: any) => {
          // Asumiendo que la respuesta contiene { jwt, user }
          localStorage.setItem('token', response.jwt);
          this.authService.setUser(response.user);
          // Redirigir a dashboard u otra ruta protegida
          this.router.navigate(['/dashboard/dashboard-home']);
        },
        error: (err) => {
          console.error('Error en login:', err);
          // Aquí puedes mostrar un mensaje de error al usuario
          alert('Credenciales incorrectas o error en el servidor.');
        }
      });
  }
}
