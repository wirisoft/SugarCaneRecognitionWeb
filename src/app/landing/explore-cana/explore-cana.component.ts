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
  isTransitioning: boolean = false;

  especies = [
    {
      nombre: 'Caña de azúcar (Veracruz)',
      nombreCientifico: 'Saccharum officinarum',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['CP 72-2086', 'RB 92579', 'Mex 69-290'],
      plagas: ['Escaldadura', 'Virus del Mosaico', 'Pudrición Roja', 'Roya', 'Mosca Pintada'],
      imagen: 'assets/images/explore/caña-azucar.svg'
    },
    {
      nombre: 'Caña Morada',
      nombreCientifico: 'Saccharum sinense',
      genero: 'Saccharum',
      familia: 'Poaceae',
      variedades: ['Co 740', 'RB 867515'],
      plagas: ['Amarillamiento Foliar', 'Escaldadura', 'Roya'],
      imagen: 'assets/images/explore/caña-morada.svg'
    }
  ];

  plagas = [
    // Enfermedades del sistema de IA
    
    {
      nombre: 'Escaldadura de la Hoja',
      nombreCientifico: 'Xanthomonas albilineans',
      descripcion: 'Enfermedad bacteriana que causa rayas blancas características en las hojas y marchitez de la planta.',
      nivelDanio: 'Alto',
      temporadaComun: 'Época húmeda (mayo-octubre)',
      imagen: 'assets/images/explore/left_scald.png'
    },
    {
      nombre: 'Virus del Mosaico',
      nombreCientifico: 'Sugarcane mosaic virus (SCMV)',
      descripcion: 'Virus que causa patrones de mosaico amarillo-verde en las hojas y reduce el crecimiento de la planta.',
      nivelDanio: 'Medio',
      temporadaComun: 'Todo el año (picos en primavera)',
      imagen: 'assets/images/explore/mosaic_virus.png'
    },
    {
      nombre: 'Mosca Pintada',
      nombreCientifico: 'Aeneolamia postica',
      descripcion: 'Insecto que succiona la savia de las hojas causando amarillamiento, secado y reducción del rendimiento.',
      nivelDanio: 'Medio',
      temporadaComun: 'Época lluviosa (junio-septiembre)',
      imagen: 'assets/images/explore/painted_fly.png'
    },
    {
      nombre: 'Pudrición Roja',
      nombreCientifico: 'Colletotrichum falcatum',
      descripcion: 'Hongo que causa pudrición interna de color rojo en los tallos, afectando severamente la calidad del jugo.',
      nivelDanio: 'Severo',
      temporadaComun: 'Época seca (noviembre-abril)',
      imagen: 'assets/images/explore/red_rot.png'
    },
    {
      nombre: 'Roya Marrón',
      nombreCientifico: 'Puccinia melanocephala',
      descripcion: 'Hongo que forma pústulas de color marrón en las hojas, causando defoliación prematura.',
      nivelDanio: 'Alto',
      temporadaComun: 'Época húmeda y fresca (octubre-marzo)',
      imagen: 'assets/images/explore/roya.png'
    },
    {
      nombre: 'Amarillamiento Foliar',
      nombreCientifico: 'Leifsonia xyli subsp. xyli',
      descripcion: 'Bacteria que obstruye los vasos conductores causando amarillamiento progresivo y enanismo.',
      nivelDanio: 'Medio',
      temporadaComun: 'Todo el año (síntomas más evidentes en sequía)',
      imagen: 'assets/images/explore/yellow.png'
    },
    
    
  ];

  openImageModal(imagen: string, titulo: string) {
    this.selectedImage = imagen;
    this.selectedTitle = titulo;
  }

  // Método mejorado para cambiar de vista con animación
  cambiarVista(nuevaVista: string) {
    if (this.vista === nuevaVista || this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Agregar clase de transición de salida
    setTimeout(() => {
      this.vista = nuevaVista;
      
      // Remover clase de transición después de un tiempo
      setTimeout(() => {
        this.isTransitioning = false;
      }, 300);
    }, 150);
  }

  // Método para buscar especies
  filtrarEspecies(termino: string) {
    if (!termino) return this.especies;
    termino = termino.toLowerCase();
    return this.especies.filter(especie => 
      especie.nombre.toLowerCase().includes(termino) ||
      especie.nombreCientifico.toLowerCase().includes(termino) ||
      especie.genero.toLowerCase().includes(termino) ||
      especie.familia.toLowerCase().includes(termino) ||
      especie.variedades.some(v => v.toLowerCase().includes(termino))
    );
  }

  // Método para buscar plagas
  filtrarPlagas(termino: string) {
    if (!termino) return this.plagas;
    termino = termino.toLowerCase();
    return this.plagas.filter(plaga => 
      plaga.nombre.toLowerCase().includes(termino) ||
      plaga.nombreCientifico.toLowerCase().includes(termino) ||
      plaga.descripcion.toLowerCase().includes(termino) ||
      plaga.nivelDanio.toLowerCase().includes(termino) ||
      plaga.temporadaComun.toLowerCase().includes(termino)
    );
  }

  // Método para obtener la clase CSS según el nivel de daño
  getNivelDanioClass(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'ninguno': return 'text-success';
      case 'bajo': return 'text-info';
      case 'medio': return 'text-warning';
      case 'alto': return 'text-danger';
      case 'severo': 
      case 'crítico': return 'text-dark bg-danger text-white px-2 py-1 rounded';
      default: return 'text-muted';
    }
  }

  // Método para obtener el icono según el nivel de daño
  getNivelDanioIcon(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'ninguno': return 'fas fa-check-circle';
      case 'bajo': return 'fas fa-info-circle';
      case 'medio': return 'fas fa-exclamation-triangle';
      case 'alto': return 'fas fa-exclamation-circle';
      case 'severo': 
      case 'crítico': return 'fas fa-skull-crossbones';
      default: return 'fas fa-question-circle';
    }
  }

  // Método para obtener imagen con fallback
  getImageUrl(imagen: string): string {
    // Si la imagen no existe, usar caña-azucar.svg como fallback
    return imagen || 'assets/images/explore/caña-azucar.svg';
  }

  // Método para manejar errores de imagen
  onImageError(event: any) {
    // Usar caña-azucar.svg como imagen por defecto si falla la carga
    event.target.src = 'assets/images/explore/caña-azucar.svg';
  }
}