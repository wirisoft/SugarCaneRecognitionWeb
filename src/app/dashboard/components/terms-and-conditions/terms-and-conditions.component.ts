import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterCanaComponent } from '../../../landing/components/footer-cana/footer-cana.component';
import { NavBarCanaComponent } from '../../../landing/components/nav-bar-cana/nav-bar-cana.component';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule, NavBarCanaComponent, FooterCanaComponent],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css'
})
export class TermsAndConditionsComponent {

}
