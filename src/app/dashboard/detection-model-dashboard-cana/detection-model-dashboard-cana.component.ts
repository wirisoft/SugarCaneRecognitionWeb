import { Component } from '@angular/core';
// Add FormsModule import
import { FormsModule } from '@angular/forms';
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
  id: number;
  name: string;
  version: string;
  description: string;
  modelData: string;
  trainingDate: Date;
  precisionMetric: number;
  type: string;
  isActive: boolean;
}

@Component({
  selector: 'app-detection-model-dashboard-cana',
  standalone: true,
  imports: [CommonModule, NavBarDashboardCanaComponent, AgGridAngular, FormsModule],
  templateUrl: './detection-model-dashboard-cana.component.html',
  styleUrl: './detection-model-dashboard-cana.component.css'
})
export class DetectionModelDashboardCanaComponent {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
    browserColorScheme: "light",
    headerFontSize: 14
  });

  // Row Data
  rowData: IRow[] = [
    { 
      id: 1, 
      name: "Disease Detection v1", 
      version: "1.0.0", 
      description: "Modelo para detección de enfermedades en caña",
      modelData: "base64_encoded_data",
      trainingDate: new Date(2024, 0, 1),
      precisionMetric: 0.95,
      type: "DISEASE",
      isActive: true
    },
    { 
      id: 2, 
      name: "Pest Detection v1", 
      version: "1.0.0", 
      description: "Modelo para detección de plagas",
      modelData: "base64_encoded_data",
      trainingDate: new Date(2024, 0, 15),
      precisionMetric: 0.92,
      type: "PEST",
      isActive: true
    },
    { 
      id: 3, 
      name: "Combined Model v1", 
      version: "1.0.0", 
      description: "Modelo combinado para detección de plagas y enfermedades",
      modelData: "base64_encoded_data",
      trainingDate: new Date(2024, 1, 1),
      precisionMetric: 0.88,
      type: "BOTH",
      isActive: true
    }
  ];

  onDeleteModel(id: number) {
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
        this.rowData = this.rowData.filter(row => row.id !== id);
        Swal.fire(
          '¡Eliminado!',
          'El modelo ha sido eliminado.',
          'success'
        );
      }
    });
  }

  selectedModel: IRow | null = null;
  isEditing: boolean = false;

  showModelInfo(model: IRow) {
    this.selectedModel = model;
  }

  hideModelInfo() {
    this.selectedModel = null;
  }

  editModel(model: IRow) {
    this.isEditing = true;
    this.showNewModelForm = true;
    this.selectedModel = { ...model };
    // Add scroll to top
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  // Add new method for form submission
  onSubmitForm() {
    if (this.isEditing && this.selectedModel) {
      const index = this.rowData.findIndex(model => model.id === this.selectedModel!.id);
      if (index !== -1) {
        this.rowData[index] = { ...this.selectedModel };
        Swal.fire({
          title: '¡Éxito!',
          text: 'Modelo actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#1a472a'
        });
        this.toggleView();
      }
    } else {
      // Handle new model creation
      const newModel: IRow = {
        ...this.selectedModel!,
        id: this.rowData.length + 1,
        trainingDate: new Date(),
        isActive: true
      };
      this.rowData = [...this.rowData, newModel];
      Swal.fire({
        title: '¡Éxito!',
        text: 'Nuevo modelo creado correctamente',
        icon: 'success',
        confirmButtonColor: '#1a472a'
      });
      this.toggleView();
    }
  }

  // Update toggle view method
  toggleView() {
    this.showNewModelForm = !this.showNewModelForm;
    if (!this.showNewModelForm) {
      this.isEditing = false;
      this.selectedModel = null;
    } else if (!this.isEditing) {
      // Initialize empty model for new creation
      this.selectedModel = {
        id: 0,
        name: '',
        version: '',
        description: '',
        modelData: '',
        trainingDate: new Date(),
        precisionMetric: 0,
        type: 'DISEASE',
        isActive: true
      };
    }
  }

  // Update column definitions
  colDefs: ColDef<IRow>[] = [
    { field: "id", flex: .5 },
    { field: "name", headerName: "Nombre", sortable: true, editable: true },
    { field: "version", sortable: true, editable: true },
    { field: "description", headerName: "Descripción", sortable: true, editable: true },
    { field: "trainingDate", headerName: "Fecha de Entrenamiento", sortable: true },
    { field: "precisionMetric", headerName: "Precisión", sortable: true },
    { field: "type", headerName: "Tipo", sortable: true, editable: true },
    { 
      field: "isActive", 
      headerName: "Estado", 
      sortable: true,
      cellRenderer: (params: ICellRendererParams) => {
        return params.value ? 'Activo' : 'Inactivo';
      }
    },
    {
      headerName: 'Acciones',
      width: 120,
      pinned: 'right',
      lockPosition: true,
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => {
        const div = document.createElement('div');
        div.className = 'action-buttons';
        div.innerHTML = `
          <button class="btn edit-action" title="Editar">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="btn delete-action" title="Eliminar">
            <i class="bi bi-trash-fill"></i>
          </button>
        `;
        
        const editButton = div.querySelector('.edit-action');
        const deleteButton = div.querySelector('.delete-action');
        
        if (editButton) {
          editButton.addEventListener('click', () => {
            Swal.fire({
              title: 'Editar Modelo',
              html: `
                <div class="text-start">
                  <p><strong>Nombre:</strong> ${params.data.name}</p>
                  <p><strong>Versión:</strong> ${params.data.version}</p>
                  <p><strong>Descripción:</strong> ${params.data.description}</p>
                  <p><strong>Tipo:</strong> ${params.data.type}</p>
                  <p><strong>Precisión:</strong> ${params.data.precisionMetric}</p>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Editar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#257032'
            }).then((result) => {
              if (result.isConfirmed) {
                this.editModel(params.data);
              }
            });
          });
        }
        
        if (deleteButton) {
          deleteButton.addEventListener('click', () => {
            this.onDeleteModel(params.data.id);
          });
        }
        
        return div;
      }
    }
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };

  showNewModelForm: boolean = false;

 
}
