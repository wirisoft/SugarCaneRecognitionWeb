import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar-cana',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar-cana.component.html',
  styleUrls: ['./nav-bar-cana.component.css']
})
export class NavBarCanaComponent {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const navbar = this.el.nativeElement.querySelector('.sticky-top');
    if (window.scrollY > 300) {
      this.renderer.addClass(navbar, 'shadow-sm');
      this.renderer.setStyle(navbar, 'top', '0px');
    } else {
      this.renderer.removeClass(navbar, 'shadow-sm');
      this.renderer.setStyle(navbar, 'top', '-100px');
    }
  }
}
