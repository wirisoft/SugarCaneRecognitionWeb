import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';

@Component({
  selector: 'app-login-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent],
  templateUrl: './login-cana.component.html',
  styleUrl: './login-cana.component.css'
})
export class LoginCanaComponent {

}
