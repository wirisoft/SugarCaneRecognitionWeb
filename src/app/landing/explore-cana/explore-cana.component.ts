import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';

@Component({
  selector: 'app-explore-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent],
  templateUrl: './explore-cana.component.html',
  styleUrl: './explore-cana.component.css'
})
export class ExploreCanaComponent {

}
