import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule],
  templateUrl: './register-cana.component.html',
  styleUrl: './register-cana.component.css'
})
export class RegisterCanaComponent {
  
}
