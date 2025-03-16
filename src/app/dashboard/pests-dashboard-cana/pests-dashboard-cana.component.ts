import { Component } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

ModuleRegistry.registerModules([AllCommunityModule]);


// Row Data Interface
interface IRow {
  Id: number;
  NombreComun: string;
  NivelDaño: number;
  MetodoPrevencion: string;
  imagen: string;
}

// Componente para renderizar la imagen
// Update the ImageCellRenderer component
@Component({
  selector: 'image-cell',
  template: `
    <img [src]="imageUrl" 
         [alt]="alt" 
         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; cursor: pointer;"
         data-bs-toggle="modal" 
         data-bs-target="#imageModal"
         (click)="openModal()">
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ImageCellRenderer {
  imageUrl: string = '';
  alt: string = '';

  agInit(params: ICellRendererParams): void {
    this.imageUrl = params.value;
    this.alt = 'Plaga imagen';
  }

  openModal() {
    try {
      const modalImg = document.getElementById('modalImage');
      if (!modalImg) {
        console.error('Modal image element not found');
        return;
      }
      (modalImg as HTMLImageElement).src = this.imageUrl;
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
}

// Update the main component's ngOnInit
@Component({
  selector: 'app-pests-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    NavBarDashboardCanaComponent,
    AgGridAngular,
    ImageCellRenderer
  ],
  templateUrl: './pests-dashboard-cana.component.html',
  styleUrl: './pests-dashboard-cana.component.css'
})
export class PestsDashboardCanaComponent {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
        borderRadius: 10,
        browserColorScheme: "light",
        columnBorder: false,
        fontFamily: {
            googleFont: "Open Sans"
        },
        headerFontSize: 14,
        headerRowBorder: true,
        oddRowBackgroundColor: "#FFFFFF",
        rowBorder: false,
        wrapperBorder: true,
        wrapperBorderRadius: 12
  });
 
   // Row Data: The data to be displayed.
   rowData: IRow[] = [
    { 
      Id: 1, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 10,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 2, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 10,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 3, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 10,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 4, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 5,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 5, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 7,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 6, 
      NombreComun: "Gusano Barrenador", 
      NivelDaño: 3,
      MetodoPrevencion: "Plaga común en caña", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<IRow>[] = [
    { field: "Id",flex: .2,},
    { field: "NombreComun", sortable: true, editable: true },
    { field: "NivelDaño", sortable: true, editable: true },
    { field: "MetodoPrevencion",flex: 1, sortable: true, editable: true },
    { 
      field: "imagen",
      flex: .5,
      cellRenderer: ImageCellRenderer,
      width: 100,
      cellStyle: {  }
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };

  ngOnInit() {
    try {
      const imageModal = document.getElementById('imageModal');
      if (imageModal) {
        imageModal.addEventListener('hidden.bs.modal', function () {
          const modalImg = document.getElementById('modalImage');
          if (modalImg) {
            (modalImg as HTMLImageElement).src = '';
          }
        });
      }
    } catch (error) {
      console.error('Error setting up modal listener:', error);
    }
  }

  showNewPestForm: boolean = false;  // Changed from showNewPlantForm

  toggleView() {
    this.showNewPestForm = !this.showNewPestForm;
  }
}
