import { DetectionModelService } from './../../services/detection-model.service';
import { DetectionModel } from './../../models/detection-model';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { ICellRendererParams } from 'ag-grid-community';
import Swal from 'sweetalert2';

import { DatePipe } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-detection-model-dashboard-cana',
  standalone: true,
  imports: [CommonModule, NavBarDashboardCanaComponent, AgGridAngular, FormsModule],
  templateUrl: './detection-model-dashboard-cana.component.html',
  styleUrl: './detection-model-dashboard-cana.component.css',
  providers: [DatePipe]
})
export class DetectionModelDashboardCanaComponent implements OnInit {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
    browserColorScheme: "light",
    headerFontSize: 14
  });

  // Row Data
  rowData: DetectionModel[] = [];
  loading: boolean = false;
  
  // Form model
  model: DetectionModel = {
    name: '',
    version: '',
    description: '',
    type: 'DISEASE',
    precisionMetric: 0,
    active: true
  };

  selectedModel: DetectionModel | null = null;
  isEditing: boolean = false;
  showNewModelForm: boolean = false;
  modelFile: File | null = null;

  constructor(
    private detectionModelService: DetectionModelService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadDetectionModels();
  }

  loadDetectionModels(): void {
    this.loading = true;
    this.detectionModelService.getAllDetectionModels()
      .pipe(
        catchError(error => {
          console.error('Error loading detection models:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los modelos. Por favor, intente de nuevo más tarde.',
            icon: 'error',
            confirmButtonColor: '#1a472a'
          });
          return of([] as DetectionModel[]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(models => {
        this.rowData = models;
      });
  }

  showModelInfo(model: DetectionModel) {
    this.selectedModel = model;
  }

  hideModelInfo() {
    this.selectedModel = null;
  }

  editModel(model: DetectionModel) {
    this.isEditing = true;
    this.showNewModelForm = true;
    this.model = { ...model };
    this.selectedModel = { ...model };
    // Add scroll to top
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

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
        this.loading = true;
        this.detectionModelService.deleteDetectionModel(id)
          .pipe(
            catchError(error => {
              console.error('Error deleting model:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el modelo.',
                icon: 'error',
                confirmButtonColor: '#1a472a'
              });
              return of(null);
            }),
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe(response => {
            if (response !== null) {
              this.loadDetectionModels();
              Swal.fire({
                title: '¡Eliminado!',
                text: 'El modelo ha sido eliminado.',
                icon: 'success',
                confirmButtonColor: '#1a472a'
              });
            }
          });
      }
    });
  }

  // Handle file input
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.modelFile = element.files[0];
      
      // Convert to base64 for preview/upload
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.model.modelData = reader.result.split(',')[1]; // Remove data:application/... prefix
        }
      };
      reader.readAsDataURL(this.modelFile);
    }
  }

  onSubmitForm() {
    this.loading = true;
    
    // Format date if available
    if (this.model.trainingDate) {
      const date = new Date(this.model.trainingDate);
      this.model.trainingDate = date.toISOString();
    } else {
      this.model.trainingDate = new Date().toISOString();
    }

    if (this.isEditing && this.model.id) {
      this.detectionModelService.updateDetectionModel(this.model.id, this.model)
        .pipe(
          catchError(error => {
            console.error('Error updating model:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el modelo.',
              icon: 'error',
              confirmButtonColor: '#1a472a'
            });
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe(updatedModel => {
          if (updatedModel) {
            this.loadDetectionModels();
            Swal.fire({
              title: '¡Éxito!',
              text: 'Modelo actualizado correctamente',
              icon: 'success',
              confirmButtonColor: '#1a472a'
            });
            this.toggleView();
          }
        });
    } else {
      this.detectionModelService.createDetectionModel(this.model)
        .pipe(
          catchError(error => {
            console.error('Error creating model:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo crear el modelo.',
              icon: 'error',
              confirmButtonColor: '#1a472a'
            });
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe(newModel => {
          if (newModel) {
            this.loadDetectionModels();
            Swal.fire({
              title: '¡Éxito!',
              text: 'Nuevo modelo creado correctamente',
              icon: 'success',
              confirmButtonColor: '#1a472a'
            });
            this.toggleView();
          }
        });
    }
  }

  toggleView() {
    this.showNewModelForm = !this.showNewModelForm;
    if (!this.showNewModelForm) {
      this.isEditing = false;
      this.selectedModel = null;
      this.resetForm();
    } else if (!this.isEditing) {
      // Initialize empty model for new creation
      this.resetForm();
    }
  }

  resetForm() {
    this.model = {
      name: '',
      version: '',
      description: '',
      modelData: '',
      type: 'DISEASE',
      precisionMetric: 0,
      active: true
    };
    this.modelFile = null;
  }

  // Corrige las definiciones de columnas, específicamente los valueFormatters

colDefs: ColDef<DetectionModel>[] = [
  { field: "id", flex: .5 },
  { field: "name", headerName: "Nombre", sortable: true },
  { field: "version", sortable: true },
  { field: "description", headerName: "Descripción", sortable: true },
  { 
    field: "trainingDate", 
    headerName: "Fecha de Entrenamiento", 
    sortable: true,
    valueFormatter: params => {
      // Asegurarse de devolver siempre un string, nunca null
      return params.value ? this.datePipe.transform(params.value, 'dd/MM/yyyy') || '' : '';
    }
  },
  { 
    field: "precisionMetric", 
    headerName: "Precisión", 
    sortable: true,
    valueFormatter: params => {
      // Asegurarse de devolver siempre un string, nunca null
      return params.value !== undefined && params.value !== null 
        ? `${(params.value * 100).toFixed(2)}%` 
        : '0%';
    }
  },
  { field: "type", headerName: "Tipo", sortable: true },
  { 
    field: "active", 
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
        <button class="btn btn-sm btn-outline-primary save-btn" title="Guardar Cambios">
          <i class="bi bi-save-fill"></i>
        </button>
        <button class="btn btn-link text-danger p-0" title="Eliminar">
          <i class="bi bi-trash-fill"></i>
        </button>
      `;
      
      const editButton = div.querySelector('.edit-action');
      const deleteButton = div.querySelector('.delete-action');
      
      if (editButton) {
        editButton.addEventListener('click', () => {
          this.editModel(params.data);
        });
      }
      
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          this.onDeleteModel(params.data.id!);
        });
      }
      
      return div;
    }
  }
];
}