import { Component } from '@angular/core';
import { NavBarCanaComponent } from "../components/nav-bar-cana/nav-bar-cana.component";
import { FooterCanaComponent } from "../components/footer-cana/footer-cana.component";

@Component({
  selector: 'app-home-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent],
  templateUrl: './home-cana.component.html',
  styleUrl: './home-cana.component.css'
})
export class HomeCanaComponent {

}
