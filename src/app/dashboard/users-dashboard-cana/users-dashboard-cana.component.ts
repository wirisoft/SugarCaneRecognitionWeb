import { UserEntity } from './../../models/user.entity';
import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import Swal from 'sweetalert2';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-users-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    NavBarDashboardCanaComponent,
    AgGridAngular,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './users-dashboard-cana.component.html',
  styleUrls: ['./users-dashboard-cana.component.css']
})
export class UsersDashboardCanaComponent implements OnInit {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
    browserColorScheme: "light",
    headerFontSize: 14
  });

  // Datos de la tabla
  rowData: UserEntity[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Formulario reactivo para crear usuarios
  userForm: FormGroup;
  showNewUserForm: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      isActive: [true, Validators.required],
      roles: [[], Validators.required]
    });
  }

  // Definición de columnas para Ag-Grid
  colDefs: ColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "firstName", headerName: "Nombre", sortable: true, editable: true },
    { field: "middleName", headerName: "Segundo Nombre", sortable: true, editable: true },
    { field: "lastName", headerName: "Apellido", sortable: true, editable: true },
    { field: "email", headerName: "Correo Electrónico", sortable: true, editable: true },
    { field: "phoneNumber", headerName: "Teléfono", sortable: true, editable: true },
    { 
      field: "isActive", 
      headerName: "Estado", 
      sortable: true, 
      editable: true, 
      valueFormatter: params => params.value ? 'Activo' : 'Inactivo' 
    },
    {
      headerName: 'Acciones',
      width: 150,
      pinned: 'right',
      lockPosition: true,
      sortable: false,
      cellRenderer: (params: any) => {
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
        const saveButton = div.querySelector('.text-primary');
        if (saveButton) {
          saveButton.addEventListener('click', () => {
            this.onSaveUserChanges(params.data);
          });
        }
        const deleteButton = div.querySelector('.text-danger');
        if (deleteButton) {
          deleteButton.addEventListener('click', () => {
            this.onDeleteUser(params.data.id);
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
    this.loadUsers();
  }

  // Cargar usuarios desde el backend
  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.rowData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Error al cargar los usuarios. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // Maneja la edición en línea
  onCellValueChanged(event: CellValueChangedEvent) {
    const user = event.data as UserEntity;
    const field = event.column.getColId();
    const newValue = event.newValue;
    console.log(`Valor cambiado en ${field}: ${newValue}`);
    // Opcional: marcar la fila como modificada
    event.node.setDataValue('_modified', true);
  }

  // Guardar cambios editados en un usuario
  onSaveUserChanges(userData: UserEntity) {
    if (!userData || !userData.id) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo identificar el usuario a actualizar',
        icon: 'error'
      });
      return;
    }
    this.isLoading = true;
    this.userService.updateUser(userData.id, userData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Los cambios han sido guardados correctamente',
          icon: 'success',
          timer: 2000
        });
        this.loadUsers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron guardar los cambios. Por favor, intente de nuevo.',
          icon: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  // Eliminar usuario
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
        this.isLoading = true;
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire(
              '¡Eliminado!',
              'El usuario ha sido eliminado.',
              'success'
            );
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar el usuario.',
              'error'
            );
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Alterna la vista entre la tabla y el formulario de creación
  toggleView() {
    this.showNewUserForm = !this.showNewUserForm;
    if (!this.showNewUserForm) {
      this.resetForm();
    }
  }

  // Resetea el formulario
  resetForm() {
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }
    this.isLoading = true;
  
    // Transforma el valor del campo roles al formato que espera el backend:
    // Si se selecciona 'admin', se envía "ADMIN" (sin el prefijo "ROLE_")
    const roleValue = this.userForm.value.roles;
    const roles = roleValue === 'admin'
      ? [{ name: 'ADMIN' }]
      : [{ name: 'USER' }];
  
    // Construir el objeto usuario a enviar, incluyendo el arreglo de roles correctamente formateado
    const userData: UserEntity = {
      ...this.userForm.value,
      roles
    };
  
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Usuario creado correctamente',
          icon: 'success'
        });
        this.loadUsers();
        this.toggleView();
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el usuario',
          icon: 'error'
        });
        this.isLoading = false;
      }
    });
  }
  
}
