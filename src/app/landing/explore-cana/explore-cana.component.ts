import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';

@Component({
  selector: 'app-explore-cana',
  standalone: true,
  imports: [
    CommonModule,
    NavBarCanaComponent, 
    FooterCanaComponent
  ],
  templateUrl: './explore-cana.component.html',
  styleUrl: './explore-cana.component.css'
})
export class ExploreCanaComponent {
  vista: string = 'plantas';
  selectedImage: string = '';
  selectedTitle: string = '';

  especies = [
    {
      nombre: 'Caña de azúcar (Veracruz)',
      nombreCientifico: 'Saccharum officinarum',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['CP 72-2086', 'RB 92579', 'Mex 69-290'],
      plagas: ['Barrenador de la Caña', 'Pulgón amarillo'],
      imagen: '../../../assets/images/explore/caña-azucar.svg'
    },
    {
      nombre: 'Caña Morada',
      nombreCientifico: 'Saccharum sinense',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['Co 740', 'RB 867515'],
      plagas: ['Mosca Pinta', 'Gusano Cogollero'],
      imagen: '../../../assets/images/explore/caña-morada.svg'
    }
  ];

  plagas = [
    {
      nombre: 'Mosca Pinta',
      nombreCientifico: 'Aeneolamia spp.',
      descripcion: 'Es una plaga que afecta los cultivos de caña al chupar la savia y debilitar la planta.',
      nivelDanio: 'Alto',
      temporadaComun: 'Época de lluvias',
      imagen: '../../../assets/images/mosca_pinta.webp'
    },
    {
      nombre: 'Barrenador de la Caña',
      nombreCientifico: 'Diatraea saccharalis',
      descripcion: 'Las larvas perforan los tallos de la caña, afectando su crecimiento y rendimiento.',
      nivelDanio: 'Severo',
      temporadaComun: 'Verano y Otoño',
      imagen: '../../../assets/images/gusano_barrenador.webp'
    },
    {
      nombre: 'Gusano Cogollero',
      nombreCientifico: 'Spodoptera frugiperda',
      descripcion: 'Ataca el cogollo de la caña y reduce significativamente la producción.',
      nivelDanio: 'Crítico',
      temporadaComun: 'Todo el año',
      imagen: '../../../assets/images/gusano_cogollero.webp'
    }
  ];
  openImageModal(imagen: string, titulo: string) {
    this.selectedImage = imagen;
    this.selectedTitle = titulo;
  }
  // Método para buscar especies
  filtrarEspecies(termino: string) {
    if (!termino) return this.especies;
    termino = termino.toLowerCase();
    return this.especies.filter(especie => 
      especie.nombre.toLowerCase().includes(termino) ||
      especie.nombreCientifico.toLowerCase().includes(termino)
    );
  }

  // Método para buscar plagas
  filtrarPlagas(termino: string) {
    if (!termino) return this.plagas;
    termino = termino.toLowerCase();
    return this.plagas.filter(plaga => 
      plaga.nombre.toLowerCase().includes(termino) ||
      plaga.nombreCientifico.toLowerCase().includes(termino)
    );
  }
}