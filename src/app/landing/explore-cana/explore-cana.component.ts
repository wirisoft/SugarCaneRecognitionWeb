import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explore-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, FormsModule],
  templateUrl: './explore-cana.component.html',
  styleUrl: './explore-cana.component.css'
})
export class ExploreCanaComponent {

  busqueda: string = '';

  especies = [
    {
      nombre: 'Saccharum officinarum',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['CP 72-2086', 'RB 92579', 'Mex 69-290'],
      plagas: ['Barrenador de la caña', 'Pulgón amarillo']
    },
    {
      nombre: 'Saccharum sinense',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['Co 740', 'RB 867515'],
      plagas: ['Mosca pinta', 'Roya marrón']
    }
  ];


}
