import { Component } from '@angular/core';
import { NavBarCanaComponent } from '../components/nav-bar-cana/nav-bar-cana.component';
import { FooterCanaComponent } from '../components/footer-cana/footer-cana.component';
import { CommonModule } from '@angular/common';

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
  }

  identify(): void {
    const selectedImages = this.images.filter((img): img is string => img !== null);
    console.log(`Procesando ${selectedImages.length} imágenes`);
  }
}
