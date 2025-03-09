import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {}
  loginData = {
    email: '',
    password: ''
  };
  navigateToDashboard() {
    // Add any login validation logic here
    this.router.navigate(['/dashboard/dashboard-home']);
  }
  onSubmit() {
    // Your existing login logic here
    this.navigateToDashboard();
  }
}
