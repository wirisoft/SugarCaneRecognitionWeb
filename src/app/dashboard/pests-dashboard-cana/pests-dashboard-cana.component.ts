import { Pest } from './../../models/pest';
import { PestService } from './../../services/pest.service';
import { Component, OnInit } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';


ModuleRegistry.registerModules([AllCommunityModule]);

// Componente para renderizar la imagen
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

@Component({
  selector: 'app-pests-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    NavBarDashboardCanaComponent,
    AgGridAngular,
    ImageCellRenderer,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './pests-dashboard-cana.component.html',
  styleUrl: './pests-dashboard-cana.component.css'
})
export class PestsDashboardCanaComponent implements OnInit {
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

  // Row Data
  rowData: any[] = [];
  pestForm: FormGroup;
  selectedFile: File | null = null;
  isLoading: boolean = false;
  
  constructor(
    private pestService: PestService,
    private fb: FormBuilder
  ) {
    this.pestForm = this.fb.group({
      commonName: ['', Validators.required],
      scientificName: [''],
      damageLevel: ['', Validators.required],
      description: [''],
      commonSeason: [''],
      preventionMethods: ['', Validators.required],
      controlMethods: ['']
    });
  }

  ngOnInit() {
    this.loadPests();
    
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

  loadPests() {
    this.isLoading = true;
    this.pestService.getAllPests().subscribe({
      next: (data) => {
        this.rowData = data.map(pest => {
          return {
            Id: pest.id,
            NombreComun: pest.commonName,
            NombreCientifico: pest.scientificName,
            NivelDaño: pest.damageLevel,
            TemporadaComun: pest.commonSeason,
            Descripcion: pest.description,
            MetodoPrevencion: pest.preventionMethods,
            MetodoControl: pest.controlMethods,
            imagen: pest.image ? pest.image : '../../../assets/images/default_pest.webp',
          };
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching pests:', error);
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las plagas',
          icon: 'error',
          confirmButtonColor: '#1a472a'
        });
      }
    });
  }

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
        this.pestService.deletePest(id).subscribe({
          next: () => {
            this.rowData = this.rowData.filter(row => row.Id !== id);
            Swal.fire(
              '¡Eliminado!',
              'La plaga ha sido eliminada.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting pest:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la plaga.',
              'error'
            );
          }
        });
      }
    });
  }

  // Handle file input
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile);
    }
  }

  // Convert the selected file to base64
  convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Store the base64 string in the form or a variable
      // You can store it directly in the form if you add a hidden field
      this.selectedFile = file;
    };
    reader.readAsDataURL(file);
  }

  // Submit the form
  onSubmit() {
    if (this.pestForm.invalid) {
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos',
        icon: 'warning',
        confirmButtonColor: '#1a472a'
      });
      return;
    }

    this.isLoading = true;
    
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        
        // Create the pest object with form values and image
        const newPest: Pest = {
          commonName: this.pestForm.value.commonName,
          scientificName: this.pestForm.value.scientificName,
          damageLevel: this.pestForm.value.damageLevel,
          description: this.pestForm.value.description,
          commonSeason: this.pestForm.value.commonSeason,
          preventionMethods: this.pestForm.value.preventionMethods,
          controlMethods: this.pestForm.value.controlMethods,
          image: base64String,
          imageName: this.selectedFile?.name,
          imageType: this.selectedFile?.type
        };
        
        this.savePest(newPest);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      // Create the pest object without image
      const newPest: Pest = {
        commonName: this.pestForm.value.commonName,
        scientificName: this.pestForm.value.scientificName,
        damageLevel: this.pestForm.value.damageLevel,
        description: this.pestForm.value.description,
        commonSeason: this.pestForm.value.commonSeason,
        preventionMethods: this.pestForm.value.preventionMethods,
        controlMethods: this.pestForm.value.controlMethods
      };
      
      this.savePest(newPest);
    }
  }

  savePest(pest: Pest) {
    this.pestService.createPest(pest).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Plaga agregada correctamente',
          icon: 'success',
          confirmButtonColor: '#1a472a'
        });
        this.pestForm.reset();
        this.selectedFile = null;
        this.showNewPestForm = false;
        this.loadPests(); // Reload the list
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating pest:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la plaga',
          icon: 'error',
          confirmButtonColor: '#1a472a'
        });
      }
    });
  }
  
  colDefs: ColDef[] = [
    { field: "Id", flex: .2 },
    { field: "NombreComun", headerName: "Nombre Común", sortable: true, editable: true },
    { field: "NombreCientifico", headerName: "Nombre Científico", sortable: true, editable: true },
    { field: "NivelDaño", headerName: "Nivel de Daño", sortable: true, editable: true },
    { field: "Descripcion", headerName: "Descripción", flex: 1, sortable: true, editable: true },
    { field: "MetodoPrevencion", headerName: "Método de Prevención", flex: 1, sortable: true, editable: true },
    { field: "MetodoControl", headerName: "Método de Control", flex: 1, sortable: true, editable: true },
    { 
      field: "imagen",
      headerName: "Imagen",
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
          <div class="d-flex">
            <button class="btn btn-sm btn-outline-primary save-btn" title="Guardar Cambios">
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

  showNewPestForm: boolean = false;

  toggleView() {
    this.showNewPestForm = !this.showNewPestForm;
    if (!this.showNewPestForm) {
      this.pestForm.reset();
      this.selectedFile = null;
    }
  }
}