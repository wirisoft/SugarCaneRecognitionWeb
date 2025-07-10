import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../../../landing/components/nav-bar-cana/nav-bar-cana.component';
import { CommonModule } from '@angular/common';
import { FooterCanaComponent } from '../../../landing/components/footer-cana/footer-cana.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, NavBarCanaComponent, FooterCanaComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {

}
