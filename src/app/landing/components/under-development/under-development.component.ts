import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../nav-bar-cana/nav-bar-cana.component';
import { CommonModule } from '@angular/common';
import { FooterCanaComponent } from '../footer-cana/footer-cana.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-under-development',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule, RouterModule],
  templateUrl: './under-development.component.html',
  styleUrl: './under-development.component.css'
})
export class UnderDevelopmentComponent {

}
