import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    console.log('Login attempt with:', this.loginData);
  }

}
