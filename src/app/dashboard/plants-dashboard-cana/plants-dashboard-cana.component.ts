import { PlantService } from './../../services/plant.service';
import { Plant } from './../../models/plant';
import { Component, OnInit } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageCellRenderer } from '../pests-dashboard-cana/pests-dashboard-cana.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-plants-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    NavBarDashboardCanaComponent,
    AgGridAngular,
    ImageCellRenderer,
    HttpClientModule,
    ReactiveFormsModule
  ],
  templateUrl: './plants-dashboard-cana.component.html',
  styleUrls: ['./plants-dashboard-cana.component.css']
})
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
 
  rowData: any[] = [];
  plantForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedFile: File | null = null;
  showNewPlantForm: boolean = false;
  
  constructor(
    private plantService: PlantService,
    private fb: FormBuilder
  ) {
    this.plantForm = this.fb.group({
      commonName: ['', Validators.required],
      scientificName: [''],
      description: [''],
      image: [''],
      imageName: [''],
      imageType: ['']
    });
  }

  // Definición de columnas para Ag-Grid
  colDefs: ColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "commonName", headerName: "Nombre Común", sortable: true, editable: true },
    { field: "scientificName", headerName: "Nombre Científico", sortable: true, editable: true },
    { field: "description", headerName: "Descripción", sortable: true, editable: true },
    { 
      field: "image",
      headerName: "Imagen",
      cellRenderer: ImageCellRenderer,
      width: 100
    },
    { 
      field: "createdBy", 
      headerName: "Creador", 
      sortable: true,
      valueGetter: (params) => params.data.createdBy ? params.data.createdBy.username : 'N/A'
    },
    { 
      field: "createdAt", 
      headerName: "Fecha Creación", 
      sortable: true,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      headerName: 'Acciones',
      width: 150,
      pinned: 'right',
      lockPosition: true,
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => {
        const div = document.createElement('div');
        div.innerHTML = `
          <div class="d-flex">
            <button class="btn btn-link text-primary p-0 me-2" title="Guardar Cambios">
              <i class="bi bi-save-fill"></i>
            </button>
            <button class="btn btn-link text-danger p-0" title="Eliminar">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        `;
        
        const deleteButton = div.querySelector('.text-danger');
        if (deleteButton) {
          deleteButton.addEventListener('click', () => {
            this.onDeletePlant(params.data.id);
          });
        }
        
        const saveButton = div.querySelector('.text-primary');
        if (saveButton) {
          saveButton.addEventListener('click', () => {
            this.onSavePlantChanges(params.data);
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
    this.loadPlants();

    // Listener para actualizar la imagen en el modal al hacer clic en cualquier imagen con atributo data-bs-toggle
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.hasAttribute('data-bs-toggle')) {
        const modalImg = document.getElementById('modalImage') as HTMLImageElement;
        modalImg.src = target.getAttribute('src') || '';
      }
    });

    // Limpieza del modal al cerrarlo
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
      imageModal.addEventListener('hidden.bs.modal', function () {
        const modalImg = document.getElementById('modalImage') as HTMLImageElement;
        modalImg.src = '';
      });
    }
  }

  loadPlants() {
    this.isLoading = true;
    this.plantService.getAllPlants().subscribe({
      next: (data) => {
        this.rowData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching plants:', error);
        this.errorMessage = 'Error al cargar las plantas. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // Manejo de edición en celda
  onCellValueChanged(event: CellValueChangedEvent) {
    const plant = event.data as Plant;
    const field = event.column.getColId();
    const newValue = event.newValue;
    
    console.log(`Valor cambiado en ${field}: ${newValue}`);
    
    // Indicar visualmente que la fila fue modificada
    const row = event.node;
    row.setDataValue('_modified', true);
  }

  // Guardar cambios en una planta específica
  onSavePlantChanges(plantData: Plant) {
    if (!plantData || !plantData.id) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo identificar la planta a actualizar',
        icon: 'error'
      });
      return;
    }
    
    this.isLoading = true;
    
    this.plantService.updatePlant(plantData.id, plantData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Los cambios han sido guardados correctamente',
          icon: 'success',
          timer: 2000
        });
        this.loadPlants();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating plant:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron guardar los cambios. Por favor, intente de nuevo.',
          icon: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  // Selección y conversión de imagen a Base64
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (base64String) {
          const base64Content = base64String.split(',')[1];
          this.plantForm.patchValue({
            image: base64Content,
            imageName: this.selectedFile?.name,
            imageType: this.selectedFile?.type
          });
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Envío del formulario para crear una nueva planta
  onSubmit() {
    if (this.plantForm.invalid) {
      return;
    }
  
    this.isLoading = true;
    const plantData: Plant = this.plantForm.value;
    
    this.plantService.createPlant(plantData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Planta creada correctamente',
          icon: 'success'
        });
        this.loadPlants();
        this.toggleView();
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating plant:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear la planta',
          icon: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  // Eliminación de una planta
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
        this.isLoading = true;
        this.plantService.deletePlant(id).subscribe({
          next: (response) => {
            this.loadPlants();
            Swal.fire(
              '¡Eliminado!',
              'La planta ha sido eliminada.',
              'success'
            );
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting plant:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la planta.',
              'error'
            );
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Alternar la vista del formulario de nueva planta
  toggleView() {
    this.showNewPlantForm = !this.showNewPlantForm;
    if (!this.showNewPlantForm) {
      this.resetForm();
    }
  }

  // Reiniciar el formulario y limpiar el archivo seleccionado
  resetForm() {
    this.plantForm.reset();
    this.selectedFile = null;
  }

  // Cargar imagen predefinida (por ejemplo, de la carpeta assets)
  loadPredefinedImage(imageName: string) {
    const imagePath = `../../../assets/images/explore/${imageName}`;
    
    fetch(imagePath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          if (base64String) {
            const base64Content = base64String.split(',')[1];
            this.plantForm.patchValue({
              image: base64Content,
              imageName: imageName,
              imageType: 'image/svg+xml'
            });
            
            const file = new File([blob], imageName, { type: 'image/svg+xml' });
            this.selectedFile = file;
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error loading predefined image:', error);
      });
  }
}
