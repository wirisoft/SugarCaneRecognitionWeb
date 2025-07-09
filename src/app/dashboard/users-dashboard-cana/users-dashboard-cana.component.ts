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

  // 🔄 SUSTITUIR ESTA SECCIÓN en users-dashboard-cana.component.ts
// Busca la definición de colDefs y reemplaza SOLO la columna de acciones:

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
  // ✅ REEMPLAZAR ESTA COLUMNA COMPLETA:
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
          <button class="btn btn-sm btn-outline-primary save-btn" title="Guardar Cambios">
            <i class="bi bi-save-fill"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      `;
      
      // ✅ CORREGIDO: Preservar contexto con bind
      const saveButton = div.querySelector('.save-btn') as HTMLButtonElement;
      if (saveButton) {
        saveButton.addEventListener('click', ((e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔄 Botón guardar clickeado para usuario:', params.data);
          this.onSaveUserChanges(params.data);
        }).bind(this));
      }
      
      const deleteButton = div.querySelector('.delete-btn') as HTMLButtonElement;
      if (deleteButton) {
        deleteButton.addEventListener('click', ((e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🗑️ Botón eliminar clickeado para usuario ID:', params.data.id);
          this.onDeleteUser(params.data.id);
        }).bind(this));
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

  // 🔄 SUSTITUIR COMPLETAMENTE el método onDeleteUser en users-dashboard-cana.component.ts

onDeleteUser(id: number) {
  console.log('🔍 DEBUG: onDeleteUser llamado');
  console.log('🆔 ID recibido:', id, 'Tipo:', typeof id);
  
  // Validación de entrada
  if (!id || id <= 0) {
    console.error('❌ ID inválido:', id);
    Swal.fire({
      title: 'Error',
      text: 'ID de usuario inválido',
      icon: 'error'
    });
    return;
  }

  // Verificar que el usuario existe en la tabla actual
  const userExists = this.rowData.find(user => user.id === id);
  if (!userExists) {
    console.error('❌ Usuario no encontrado en la tabla actual:', id);
    Swal.fire({
      title: 'Error',
      text: 'Usuario no encontrado en la tabla',
      icon: 'error'
    });
    return;
  }

  console.log('👤 Usuario a eliminar:', userExists);
  
  Swal.fire({
    title: '¿Estás seguro?',
    html: `
      <p>Vas a eliminar al usuario:</p>
      <strong>${userExists.firstName} ${userExists.lastName}</strong><br>
      <small class="text-muted">${userExists.email}</small><br><br>
      <span class="text-danger">No podrás revertir esta acción</span>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1a472a',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    console.log('🤔 Respuesta del usuario al modal:', result);
    
    if (result.isConfirmed) {
      console.log('✅ Usuario confirmó eliminación');
      this.executeDelete(id);
    } else {
      console.log('❌ Usuario canceló eliminación');
    }
  });
}

// ✅ AGREGAR este nuevo método privado después del método onDeleteUser
private executeDelete(id: number) {
  console.log('🚀 Ejecutando eliminación para ID:', id);
  
  // Verificar token antes de hacer la petición
  const token = localStorage.getItem('token') || localStorage.getItem('sessionToken');
  if (!token) {
    console.error('❌ No hay token de autenticación');
    Swal.fire({
      title: 'Error de Autenticación',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      icon: 'error'
    });
    return;
  }

  console.log('🔑 Token encontrado, procediendo con eliminación...');
  this.isLoading = true;

  // Hacer la petición
  this.userService.deleteUser(id).subscribe({
    next: (response) => {
      console.log('✅ Respuesta exitosa del servidor:', response);
      
      // Recargar datos
      this.loadUsers();
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El usuario ha sido eliminado exitosamente.',
        icon: 'success',
        timer: 3000
      });
      
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Error completo:', error);
      console.error('📊 Status:', error.status);
      console.error('📝 StatusText:', error.statusText);
      console.error('🔍 Error body:', error.error);
      
      this.isLoading = false;
      
      let errorMessage = 'No se pudo eliminar el usuario';
      
      // Manejar diferentes tipos de errores
      if (error.status === 403) {
        errorMessage = 'No tienes permisos para eliminar usuarios. Solo los administradores pueden realizar esta acción.';
      } else if (error.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 404) {
        errorMessage = 'El usuario no fue encontrado en el servidor.';
      } else if (error.status === 409) {
        errorMessage = 'No se puede eliminar el usuario porque tiene datos relacionados.';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: 'Error al Eliminar',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  });
}

// ✅ AGREGAR estos métodos de test temporalmente (puedes eliminarlos después)
testDeleteDirectly() {
  console.log('🧪 Test directo de eliminación');
  
  // Usa un ID que sepas que existe
  const testId = this.rowData.length > 0 ? this.rowData[0].id : 1;
  
  console.log('🔍 Probando eliminación directa del ID:', testId);
  
  if (!testId) {
    alert('No hay usuarios para probar');
    return;
  }
  
  this.userService.deleteUser(testId).subscribe({
    next: (response) => {
      console.log('✅ Test exitoso:', response);
      alert('El servicio de eliminación funciona correctamente');
    },
    error: (error) => {
      console.error('❌ Test fallido:', error);
      alert(`Error en el test: ${error.message || error.status}`);
    }
  });
}

testBackendConnection() {
  console.log('🧪 Probando conexión con backend');
  
  this.userService.getAllUsers().subscribe({
    next: (users) => {
      console.log('✅ Conexión exitosa, usuarios obtenidos:', users.length);
      alert(`Conexión OK - ${users.length} usuarios encontrados`);
    },
    error: (error) => {
      console.error('❌ Error de conexión:', error);
      alert(`Error de conexión: ${error.status} - ${error.message}`);
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