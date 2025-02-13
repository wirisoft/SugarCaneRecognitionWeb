import { Component } from '@angular/core';
import { NavBarCanaComponent } from "../components/nav-bar-cana/nav-bar-cana.component";
import { FooterCanaComponent } from "../components/footer-cana/footer-cana.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule],
  templateUrl: './home-cana.component.html',
  styleUrl: './home-cana.component.css'
})
export class HomeCanaComponent {
  researchers = [
    { name: "Daniela Ibañez Marcial", role: "Investigador Principal", image: "assets/images/daniela.webp" },
    { name: "Rosalía De los Ángeles De la Rosa Reyes", role: "Análisis de Datos", image: "assets/images/rosa.webp" },
    { name: "Josef Efraín Aguilar Campos", role: "Desarrollo de Software", image: "assets/placeholder.jpg" },
    { name: "Alejandro Alvízar Hernández", role: "Ingeniero de Drones", image: "assets/placeholder.jpg" },
    { name: "Martin Ramírez Martín", role: "Especialista en IA", image: "assets/placeholder.jpg" },
    { name: "Sergio Velazquez Bonilla", role: "GOAT UTCV", image: "assets/placeholder.jpg" },
  ];

  benefits = [
    { icon: 'bi bi-bug', title: 'Detección temprana' },
    { icon: 'bi bi-camera', title: 'Monitoreo preciso' },
    { icon: 'bi bi-award', title: 'Reducción de pérdidas' },
    { icon: 'bi bi-tree', title: 'Menor impacto ambiental' },
    { icon: 'bi bi-database', title: 'Análisis automatizado' },
    { icon: 'bi bi-file-earmark-text', title: 'Reportes detallados' }
  ];
}