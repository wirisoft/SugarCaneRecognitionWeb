import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer-cana',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer-cana.component.html',
  styleUrl: './footer-cana.component.css'
})
export class FooterCanaComponent {
  currentYear: number = new Date().getFullYear();
}
