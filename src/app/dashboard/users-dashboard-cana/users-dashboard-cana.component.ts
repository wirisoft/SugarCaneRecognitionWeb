import { Component } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { ICellRendererParams } from 'ag-grid-community';
import Swal from 'sweetalert2';

ModuleRegistry.registerModules([AllCommunityModule]);


// Row Data Interface
interface IRow {
  Id: number;
  Nombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  CorreoElectronico: string;
  Telefono: number;
  Roles: string;
  Estado: string;
  FechaCreacion: Date;
}
@Component({
  selector: 'app-users-dashboard-cana',
  standalone: true,
  imports: [CommonModule, NavBarDashboardCanaComponent, AgGridAngular],
  templateUrl: './users-dashboard-cana.component.html',
  styleUrl: './users-dashboard-cana.component.css'
})
export class UsersDashboardCanaComponent {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
    browserColorScheme: "light",
    headerFontSize: 14
  });
 
   // Row Data: The data to be displayed.
   rowData: IRow[] = [
    { Id: 1, Nombre: "Pepe", PrimerApellido: "Ricolino", SegundoApellido: "García", CorreoElectronico: "Model Y", Telefono: 64950, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 5, Nombre: "Juan", PrimerApellido: "López", SegundoApellido: "Pérez", CorreoElectronico: "F-Series", Telefono: 33850, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 6, Nombre: "María", PrimerApellido: "González", SegundoApellido: "Ruiz", CorreoElectronico: "Corolla", Telefono: 29600, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 7, Nombre: "Carlos", PrimerApellido: "Martínez", SegundoApellido: "Silva", CorreoElectronico: "EQA", Telefono: 48890, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 8, Nombre: "Ana", PrimerApellido: "Sánchez", SegundoApellido: "Torres", CorreoElectronico: "500", Telefono: 15774, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 9, Nombre: "Luis", PrimerApellido: "Ramírez", SegundoApellido: "Castro", CorreoElectronico: "Juke", Telefono: 20675, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
  ];

  // Column Definitions: Defines & controls grid columns.
  // Add delete handler
  // Updated delete handler with SweetAlert2
  onDeleteUser(id: number) {
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
          'El usuario ha sido eliminado.',
          'success'
        );
      }
    });
  }

  // Updated column definitions
  colDefs: ColDef<IRow>[] = [
    { field: "Id", flex: .5 },
    { field: "Nombre", sortable: true, editable: true },
    { field: "PrimerApellido", headerName: "Primer Apellido", sortable: true, editable: true },
    { field: "SegundoApellido", headerName: "Segundo Apellido", sortable: true, editable: true },
    { field: "CorreoElectronico", sortable: true, editable: true },
    { field: "Telefono", sortable: true, editable: true },
    { field: "Roles", sortable: true, editable: true },
    { field: "Estado", sortable: true, editable: true },
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
            this.onDeleteUser(params.data.Id);
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
  }

  showNewUserForm: boolean = false;  // Changed from showNewPlantForm

  toggleView() {
    this.showNewUserForm = !this.showNewUserForm;
  }
}
