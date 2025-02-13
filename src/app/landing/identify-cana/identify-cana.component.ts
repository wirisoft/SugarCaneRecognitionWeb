import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';

// Interfaces
interface Planta {
  id_planta: number;
  nombre_comun: string;
  nombre_cientifico: string;
  genero: string;
  familia: string;
  descripcion: string;
}

interface Variedad {
  id_variedad: number;
  nombre: string;
  codigo: string;
  caracteristicas: string;
  planta_id: number;
}

interface Plaga {
  id_plaga: number;
  nombre_comun: string;
  nombre_cientifico: string;
  descripcion: string;
  nivel_danio: string;
  temporada_comun: string;
  planta_id: number;
}

interface Sintoma {
  id_sintoma: number;
  nombre: string;
  descripcion: string;
  plaga_id: number;
}

interface DetectionResult {
  id: number;
  imagen: string;
  confianza: number;
  plaga: Plaga;
  variedad: Variedad;
  sintomas: Sintoma[];
  fecha: Date;
}

@Component({
  selector: 'app-identify-cana',
  standalone: true,
  imports: [NavBarCanaComponent, FooterCanaComponent, CommonModule],
  templateUrl: './identify-cana.component.html',
  styleUrl: './identify-cana.component.css'
})
export class IdentifyCanaComponent {
  images: (string | null)[] = new Array(4).fill(null);
  imageIndexes = [0, 1, 2, 3];
  isAnalyzing: boolean = false;
  analysisResults: DetectionResult[] = [];

  // Datos simulados
  private plantas: Planta[] = [{
    id_planta: 1,
    nombre_comun: 'Caña de Azúcar',
    nombre_cientifico: 'Saccharum officinarum',
    genero: 'Saccharum',
    familia: 'Poaceae',
    descripcion: 'Planta perenne de la familia de las poáceas'
  }];

  private variedades: Variedad[] = [
    {
      id_variedad: 1,
      nombre: 'CP 72-2086',
      codigo: 'CP722086',
      caracteristicas: 'Variedad de alto rendimiento',
      planta_id: 1
    },
    {
      id_variedad: 2,
      nombre: 'MEX 69-290',
      codigo: 'MEX69290',
      caracteristicas: 'Resistente a sequía',
      planta_id: 1
    }
  ];

  private plagas: Plaga[] = [
    {
      id_plaga: 1,
      nombre_comun: 'Barrenador de la caña',
      nombre_cientifico: 'Diatraea saccharalis',
      descripcion: 'Insecto que perfora el tallo de la caña',
      nivel_danio: 'Alto',
      temporada_comun: 'Verano',
      planta_id: 1
    },
    {
      id_plaga: 2,
      nombre_comun: 'Salivazo',
      nombre_cientifico: 'Aeneolamia postica',
      descripcion: 'Insecto que succiona la savia de las hojas',
      nivel_danio: 'Medio',
      temporada_comun: 'Primavera',
      planta_id: 1
    }
  ];

  private sintomas: Sintoma[] = [
    {
      id_sintoma: 1,
      nombre: 'Galerías en los tallos',
      descripcion: 'Túneles internos en el tallo',
      plaga_id: 1
    },
    {
      id_sintoma: 2,
      nombre: 'Muerte del cogollo',
      descripcion: 'Muerte de la parte superior de la planta',
      plaga_id: 1
    },
    {
      id_sintoma: 3,
      nombre: 'Espuma blanca',
      descripcion: 'Secreción espumosa en las hojas',
      plaga_id: 2
    }
  ];

  get hasImages(): boolean {
    return this.images.some(img => img !== null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const emptySlots = this.images.reduce((acc, curr, idx) => {
        if (curr === null) acc.push(idx);
        return acc;
      }, [] as number[]);

      files.slice(0, emptySlots.length).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              this.images[emptySlots[index]] = e.target.result as string;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.images[index] = null;
    this.analysisResults = [];
  }

  private getRandomPlaga(): Plaga {
    return this.plagas[Math.floor(Math.random() * this.plagas.length)];
  }

  private getRandomVariedad(): Variedad {
    return this.variedades[Math.floor(Math.random() * this.variedades.length)];
  }

  private getSintomasByPlagaId(plagaId: number): Sintoma[] {
    return this.sintomas.filter(s => s.plaga_id === plagaId);
  }

  identify(): void {
    this.isAnalyzing = true;
    this.analysisResults = [];

    // Simular tiempo de procesamiento
    setTimeout(() => {
      const selectedImages = this.images.filter((img): img is string => img !== null);
      
      selectedImages.forEach((image, index) => {
        const plaga = this.getRandomPlaga();
        const variedad = this.getRandomVariedad();
        const sintomas = this.getSintomasByPlagaId(plaga.id_plaga);
        
        this.analysisResults.push({
          id: index + 1,
          imagen: image,
          confianza: 0.75 + Math.random() * 0.2,
          plaga,
          variedad,
          sintomas,
          fecha: new Date()
        });
      });

      this.isAnalyzing = false;
    }, 2000);
  }
}