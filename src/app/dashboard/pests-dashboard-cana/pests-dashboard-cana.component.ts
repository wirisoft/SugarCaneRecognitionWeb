import { Component } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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
      NivelDaño: 8,
      MetodoPrevencion: "Control biológico con Trichogramma, eliminación de residuos de cosecha, uso de variedades resistentes y manejo adecuado del riego para reducir el estrés de la planta.", 
      imagen: "../../../assets/images/gusano_barrenador.webp", 
    },
    { 
      Id: 2, 
      NombreComun: "Gusano Cogollero", 
      NivelDaño: 7,
      MetodoPrevencion: "Monitoreo temprano, uso de feromonas para trampeo, control biológico con Bacillus thuringiensis y eliminación manual de larvas en etapas iniciales.", 
      imagen: "../../../assets/images/gusano_cogollero.webp", 
    },
    { 
      Id: 3, 
      NombreComun: "Mosca Pinta", 
      NivelDaño: 6,
      MetodoPrevencion: "Drenaje adecuado del campo, control de malezas, aplicación de hongos entomopatógenos como Metarhizium anisopliae y mantenimiento de enemigos naturales.", 
      imagen: "../../../assets/images/mosca_pinta.webp", 
    }
  ];

  // Column Definitions: Defines & controls grid columns.
  // Add delete handler
  onDeletePest(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a472a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rowData = this.rowData.filter(row => row.Id !== id);
        Swal.fire(
          '¡Eliminado!',
          'La plaga ha sido eliminada.',
          'success'
        );
      }
    });
  }
  
  // Update column definitions
  colDefs: ColDef<IRow>[] = [
    { field: "Id", flex: .2 },
    { field: "NombreComun", sortable: true, editable: true },
    { field: "NivelDaño", sortable: true, editable: true },
    { field: "MetodoPrevencion", flex: 1, sortable: true, editable: true },
    { 
      field: "imagen",
      flex: .5,
      cellRenderer: ImageCellRenderer,
      width: 100,
      cellStyle: { }
    },
    {
      headerName: 'Acciones',
      width: 100,
      pinned: 'right',
      lockPosition: true,
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => {
        const div = document.createElement('div');
        div.innerHTML = `
          <button class="btn btn-link text-danger p-0" title="Eliminar">
            <i class="bi bi-trash-fill"></i>
          </button>
        `;
        
        const button = div.querySelector('button');
        if (button) {
          button.addEventListener('click', () => {
            this.onDeletePest(params.data.Id);
          });
        }
        
        return div;
      }
    }
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
