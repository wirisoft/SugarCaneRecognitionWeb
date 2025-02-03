import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    console.log('Register attempt with:', this.registerData);
  }
  
}
