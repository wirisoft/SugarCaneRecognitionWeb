import { Component, OnInit } from '@angular/core';
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
  NombreoCientifico: string;
  descripcion: string;
  imagen: string;
  creador: string;
  FechaCreacion: Date;
}

// Componente para renderizar la imagen
// Actualizar ImageCellRenderer
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
  standalone: true
})
export class ImageCellRenderer {
  imageUrl: string = '';
  alt: string = '';

  agInit(params: ICellRendererParams): void {
    this.imageUrl = params.value;
    this.alt = 'Planta imagen';
  }

  openModal() {
    // El modal se maneja automáticamente por Bootstrap
  }
}

@Component({
  selector: 'app-plants-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,  // Add this import
    NavBarDashboardCanaComponent,
    AgGridAngular,
    ImageCellRenderer
  ],
  templateUrl: './plants-dashboard-cana.component.html',
  styleUrl: './plants-dashboard-cana.component.css'
})
// Add to your component class
export class PlantsDashboardCanaComponent implements OnInit {
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
      NombreComun: "Caña de Azúcar", 
      NombreoCientifico: "Saccharum officinarum", 
      descripcion: "Planta tropical", 
      imagen: "../../../assets/images/explore/caña-azucar.svg", 
      creador: "Admin", 
      FechaCreacion: new Date(2023, 1, 1)  
    },
    { 
      Id: 6, 
      NombreComun: "Caña Morada", 
      NombreoCientifico: "Saccharum officinarum var. violaceum", 
      descripcion: "Variedad de caña de azúcar caracterizada por su coloración púrpura en el tallo. Tiene alto contenido de azúcar y antocianinas. Adaptable a diferentes climas tropicales.", 
      imagen: "../../../assets/images/explore/caña-morada.svg", 
      creador: "Admin", 
      FechaCreacion: new Date(2023, 1, 1)
    },
  ];

  // Column Definitions: Defines & controls grid columns.
  // Add delete handler
  onDeletePlant(id: number) {
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
          'La planta ha sido eliminada.',
          'success'
        );
      }
    });
  }
  // Update column definitions
  colDefs: ColDef<IRow>[] = [
    { field: "Id", flex: .5 },
    { field: "NombreComun", sortable: true, editable: true },
    { field: "NombreoCientifico", sortable: true, editable: true },
    { field: "descripcion", sortable: true, editable: true },
    { 
      field: "imagen",
      cellRenderer: ImageCellRenderer,
      width: 100,
      cellStyle: { }
    },
    { field: "creador", sortable: true },
    { field: "FechaCreacion", sortable: true },
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
            this.onDeletePlant(params.data.Id);
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
    // Agregar listener para actualizar la imagen del modal
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.hasAttribute('data-bs-toggle')) {
        const modalImg = document.getElementById('modalImage') as HTMLImageElement;
        modalImg.src = target.getAttribute('src') || '';
      }
    });

    // Agregar listener para limpiar el modal al cerrarse
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
      imageModal.addEventListener('hidden.bs.modal', function () {
        const modalImg = document.getElementById('modalImage') as HTMLImageElement;
        modalImg.src = '';
      });
    }
  }

  showNewPlantForm: boolean = false;

  toggleView() {
    this.showNewPlantForm = !this.showNewPlantForm;
  }
}
