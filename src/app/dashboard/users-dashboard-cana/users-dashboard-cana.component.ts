// users-dashboard-cana.component.ts 
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
  totalUsers: number = 0;

  // Formulario reactivo para crear usuarios
  userForm: FormGroup;
  showNewUserForm: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      isActive: [true, Validators.required],
      roles: [[], Validators.required]
    });
  }

  // ✅ Definición mejorada de columnas
  colDefs: ColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5, sortable: true },
    { field: "firstName", headerName: "Nombre", sortable: true, editable: true, flex: 1 },
    { field: "middleName", headerName: "Segundo Nombre", sortable: true, editable: true, flex: 1 },
    { field: "lastName", headerName: "Apellido", sortable: true, editable: true, flex: 1 },
    { field: "email", headerName: "Correo Electrónico", sortable: true, editable: true, flex: 1.5 },
    { field: "phoneNumber", headerName: "Teléfono", sortable: true, editable: true, flex: 1 },
    { 
      field: "isActive", 
      headerName: "Estado", 
      sortable: true, 
      editable: true, 
      flex: 0.8,
      valueFormatter: params => params.value ? 'Activo' : 'Inactivo',
      cellStyle: params => ({
        color: params.value ? '#28a745' : '#dc3545',
        fontWeight: 'bold'
      })
    },
    {
      field: "roles",
      headerName: "Roles",
      sortable: false,
      flex: 1,
      valueFormatter: params => {
        if (!params.value || !Array.isArray(params.value)) return 'Sin roles';
        return params.value.map((role: any) => {
          const roleName = typeof role === 'string' ? role : role.name;
          return roleName === 'ADMIN' ? 'Administrador' : 'Usuario';
        }).join(', ');
      },
      cellStyle: { fontWeight: '500' }
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
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" title="Guardar Cambios">
              <i class="bi bi-save-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" title="Eliminar">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        `;
        const saveButton = div.querySelector('.btn-outline-primary');
        if (saveButton) {
          saveButton.addEventListener('click', () => {
            this.onSaveUserChanges(params.data);
          });
        }
        const deleteButton = div.querySelector('.btn-outline-danger');
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
    minWidth: 100,
    resizable: true
  };

  ngOnInit() {
    console.log('🚀 Inicializando componente de usuarios');
    this.loadUsers();
  }

  // ✅ Cargar usuarios mejorado con mejor manejo de errores
  loadUsers() {
    console.log('📥 Cargando usuarios...');
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Usuarios cargados exitosamente:', users);
        console.log('📊 Número de usuarios:', users?.length || 0);
        
        this.rowData = users || [];
        this.totalUsers = users?.length || 0;
        this.isLoading = false;

        // Log para debugging de roles
        if (users && users.length > 0) {
          users.forEach(user => {
            console.log(`👤 ${user.email} - Roles:`, user.roles);
          });
        }

        if (this.totalUsers === 0) {
          console.log('⚠️ No se encontraron usuarios');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        console.error('📋 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });

        this.isLoading = false;
        
        // Manejo específico de errores
        if (error.status === 403) {
          this.errorMessage = 'No tienes permisos para ver los usuarios. Solo los administradores pueden acceder a esta sección.';
        } else if (error.status === 401) {
          this.errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else {
          this.errorMessage = `Error al cargar los usuarios: ${error.message || 'Error desconocido'}`;
        }

        // Mostrar alerta de error
        Swal.fire({
          title: 'Error',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // ✅ Método mejorado para detectar cambios en las celdas
  onCellValueChanged(event: CellValueChangedEvent) {
    const user = event.data as UserEntity;
    const field = event.column.getColId();
    const newValue = event.newValue;
    const oldValue = event.oldValue;
    
    console.log(`📝 Campo modificado en usuario ${user.email}:`);
    console.log(`   - Campo: ${field}`);
    console.log(`   - Valor anterior: ${oldValue}`);
    console.log(`   - Valor nuevo: ${newValue}`);
    
    // Marcar la fila como modificada visualmente
    event.node.setDataValue('_modified', true);
  }

  // ✅ Método de guardado con actualización parcial
  onSaveUserChanges(userData: UserEntity) {
    if (!userData || !userData.id) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo identificar el usuario a actualizar',
        icon: 'error'
      });
      return;
    }

    console.log('💾 Guardando cambios para usuario:', userData);
    
    // ✅ Crear objeto SOLO con los campos que se pueden editar desde el grid
    const updates: Partial<UserEntity> = {};
    
    // Solo incluir campos editables que tienen valor
    if (userData.firstName !== undefined && userData.firstName !== null) {
      updates.firstName = userData.firstName;
    }
    
    if (userData.middleName !== undefined) {
      updates.middleName = userData.middleName;
    }
    
    if (userData.lastName !== undefined && userData.lastName !== null) {
      updates.lastName = userData.lastName;
    }
    
    if (userData.email !== undefined && userData.email !== null) {
      updates.email = userData.email;
    }
    
    if (userData.phoneNumber !== undefined) {
      updates.phoneNumber = userData.phoneNumber;
    }
    
    if (userData.isActive !== undefined) {
      updates.isActive = userData.isActive;
    }

    console.log('📤 Campos a actualizar:', updates);
    console.log('🔍 Número de campos a actualizar:', Object.keys(updates).length);

    if (Object.keys(updates).length === 0) {
      Swal.fire({
        title: 'Sin cambios',
        text: 'No se detectaron cambios para guardar',
        icon: 'info'
      });
      return;
    }

    this.isLoading = true;

    // ✅ Usar el método de actualización parcial
    this.userService.updateUserPartial(userData.id, updates).subscribe({
      next: (response) => {
        console.log('✅ Usuario actualizado exitosamente:', response);
        
        Swal.fire({
          title: '¡Actualizado!',
          html: `
            <p>Los cambios han sido guardados correctamente</p>
            <small class="text-muted">Campos actualizados: actualizados: múltiples campos
          `,
          icon: 'success',
          timer: 3000
        });
        
        this.loadUsers(); // Recargar la tabla
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al actualizar usuario:', error);
        
        let errorMessage = 'No se pudieron guardar los cambios';
        
        // Manejar errores específicos
        if (error.status === 409) {
          errorMessage = 'El email ya está registrado por otro usuario';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error'
        });
        
        this.isLoading = false;
      }
    });
  }

  onDeleteUser(id: number) {
    console.log('🗑️ Intentando eliminar usuario con ID:', id);
    
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
          next: (response) => {
            console.log('✅ Usuario eliminado exitosamente:', response);
            this.loadUsers();
            Swal.fire(
              '¡Eliminado!',
              'El usuario ha sido eliminado.',
              'success'
            );
            this.isLoading = false;
          },
          error: (error) => {
            console.error('❌ Error al eliminar usuario:', error);
            Swal.fire(
              'Error',
              `No se pudo eliminar el usuario: ${error.error?.message || error.message}`,
              'error'
            );
            this.isLoading = false;
          }
        });
      }
    });
  }

  toggleView() {
    this.showNewUserForm = !this.showNewUserForm;
    if (!this.showNewUserForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.userForm.reset({
      isActive: true,
      roles: []
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      console.log('❌ Formulario inválido:', this.userForm.errors);
      return;
    }

    console.log('📝 Enviando formulario:', this.userForm.value);
    this.isLoading = true;

    // ✅ Transformar roles correctamente
    const formValue = this.userForm.value;
    const roles = formValue.roles === 'admin' 
      ? [{ name: 'ADMIN' }] 
      : [{ name: 'USER' }];

    const userData: UserEntity = {
      ...formValue,
      roles
    };

    console.log('📤 Datos a enviar:', userData);

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        console.log('✅ Usuario creado exitosamente:', response);
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
        console.error('❌ Error al crear usuario:', error);
        Swal.fire({
          title: 'Error',
          text: `Hubo un problema al crear el usuario: ${error.error?.message || error.message}`,
          icon: 'error'
        });
        this.isLoading = false;
      }
    });
  }
}