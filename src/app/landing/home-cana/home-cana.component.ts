import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NavBarCanaComponent } from "../components/nav-bar-cana/nav-bar-cana.component";
import { FooterCanaComponent } from "../components/footer-cana/footer-cana.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var $: any; // Declaración de jQuery, ya que estamos usando jQuery y OwlCarousel

@Component({
  selector: 'app-home-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule, RouterModule],
  templateUrl: './home-cana.component.html',
  styleUrls: ['./home-cana.component.css']
})
export class HomeCanaComponent implements AfterViewInit {
  
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

  @ViewChild('testimonialPics', { static: false }) testimonialPics!: ElementRef;
  @ViewChild('testimonialContents', { static: false }) testimonialContents!: ElementRef;

  ngAfterViewInit(): void {
    $(document).ready(() => {
      $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
      });
    });

    // Back to top button
    $(window).scroll( () => {
      if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
      } else {
        $('.back-to-top').fadeOut('slow');
      }
    });
    $('.back-to-top').click(function () {
      $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
      return false;
    });

    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 2000
    });

    // Testimonial functionality
    if (this.testimonialPics && this.testimonialContents) {
      const picElements = Array.from(this.testimonialPics.nativeElement.children) as HTMLElement[];
      const textElements = Array.from(this.testimonialContents.nativeElement.children) as HTMLElement[];

      picElements.forEach((pic) => {
        pic.addEventListener("click", () => {
          picElements.forEach(elem => elem.classList.remove("active"));
          pic.classList.add("active");

          const index = Number(pic.getAttribute("id"));

          textElements.forEach(text => text.classList.remove("active"));
          if (textElements[index]) {
            textElements[index].classList.add("active");
          }
        });
      });
    }
  }
}
