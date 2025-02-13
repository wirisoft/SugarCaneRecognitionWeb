// info-sections.component.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';

@Component({
  selector: 'app-info-sections',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule],
  templateUrl: './info-sections.component.html',
  styleUrls: ['./info-sections.component.css']
})
export class InfoSectionsComponent {
  activeSection: string = 'about'; // Sección activa por defecto

  // Método para detectar la sección visible al hacer scroll
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.detectActiveSection();
  }

  // Método para detectar qué sección está visible
  detectActiveSection() {
    const sections = ['about', 'contact', 'contribute', 'privacy'];
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  // Método para hacer scroll a una sección específica
  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}