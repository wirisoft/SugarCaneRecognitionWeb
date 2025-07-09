// src/app/services/user.service.ts (CORREGIDO COMPLETAMENTE)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserEntity } from '../models/user.entity';
import { 
  UserUpdateResponse, 
  UserProfileResponse, 
  UserPaginationResponse 
} from '../models/user-response.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  // ✅ Método para obtener headers con token de autorización
  private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('token') || localStorage.getItem('sessionToken');
  
  console.log('🔍 Obteniendo headers...');
  console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
  
  if (token) {
    console.log('🔑 Token (primeros 20 chars):', token.substring(0, 20) + '...');
    
    // Verificar si el token no está expirado (opcional)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.warn('⚠️ Token expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('sessionToken');
        throw new Error('Token expirado');
      }
      
      console.log('✅ Token válido, expira en:', new Date(payload.exp * 1000));
    } catch (e) {
      console.warn('⚠️ No se pudo verificar expiración del token:', e);
    }
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });

  console.log('📋 Headers creados:', headers.keys());
  return headers;
}

  // ✅ Corregido para manejar la respuesta del backend
  getAllUsers(): Observable<UserEntity[]> {
    return this.http.get<UserPaginationResponse>(`${this.apiUrl}/get-all`, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('🔍 Respuesta completa del backend:', response);
        console.log('👥 Usuarios recibidos:', response.users);
        console.log('📊 Total elementos:', response.totalElements);
        
        // ✅ CORREGIDO: Tipado explícito del parámetro user
        if (response.users) {
          response.users.forEach((user: UserEntity) => {
            if (user.roles) {
              console.log(`🔐 Roles de ${user.email}:`, user.roles);
            }
          });
        }
        
        return response.users || [];
      })
    );
  }

  // ✅ Método adicional para obtener información completa de paginación
  getAllUsersWithPagination(page: number = 0, size: number = 20, search: string = ''): Observable<UserPaginationResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) {
      params.append('search', search);
    }

    return this.http.get<UserPaginationResponse>(`${this.apiUrl}/get-all?${params.toString()}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('🔍 Respuesta con paginación:', response);
        return response;
      })
    );
  }

  // ✅ IMPORTANTE: Método corregido para devolver Optional<UserEntity>
  getUserById(id: number): Observable<UserEntity | null> {
    return this.http.get<UserEntity>(`${this.apiUrl}/get/${id}`, { headers: this.getHeaders() }).pipe(
      map(user => {
        console.log('👤 Usuario obtenido por ID:', user);
        return user;
      })
    );
  }

  createUser(user: UserEntity): Observable<UserEntity> {
    console.log('📝 Creando usuario:', user);
    
    // ✅ Transformar roles al formato que espera el backend
    if (user.roles && Array.isArray(user.roles)) {
      user.roles = user.roles.map(role => {
        if (typeof role === 'string') {
          return { name: role as any }; // Type assertion temporal
        }
        return role;
      });
    }
    
    return this.http.post<UserEntity>(`${this.apiUrl}/create`, user, { headers: this.getHeaders() }).pipe(
      map(createdUser => {
        console.log('✅ Usuario creado:', createdUser);
        return createdUser;
      })
    );
  }

  // ✅ MÉTODO CORREGIDO CON TIPADO APROPIADO
  updateUser(id: number, updates: Partial<UserEntity>): Observable<UserEntity> {
    console.log('📝 Actualizando usuario:', id, updates);
    
    // ✅ Crear objeto con solo los campos que cambiaron
    const partialUpdate: any = {};
    
    // Solo incluir campos que tienen valor y están permitidos
    const allowedFields = ['firstName', 'middleName', 'lastName', 'email', 'phoneNumber', 'isActive', 'profileImage', 'twoFactorEnabled', 'password'];
    
    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field) && updates[field as keyof UserEntity] !== undefined) {
        partialUpdate[field] = updates[field as keyof UserEntity];
        console.log(`📝 Campo a actualizar: ${field} = ${updates[field as keyof UserEntity]}`);
      }
    });
    
    console.log('📤 Datos de actualización:', partialUpdate);
    
    // ✅ CORREGIDO: Usar any temporalmente para manejar respuestas flexibles del backend
    return this.http.patch<any>(`${this.apiUrl}/update-partial/${id}`, partialUpdate, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        
        // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
        if (response.user) {
          // Si el backend devuelve { user: UserEntity, message: string }
          console.log('✅ Usuario actualizado (formato con .user):', response.user);
          return response.user as UserEntity;
        } else if (response.email) {
          // Si el backend devuelve directamente el UserEntity
          console.log('✅ Usuario actualizado (formato directo):', response);
          return response as UserEntity;
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response);
          return response as UserEntity;
        }
      })
    );
  }

  // ✅ Nuevo método para actualización parcial (mantener compatibilidad)
  updateUserPartial(id: number, updates: Partial<UserEntity>): Observable<UserEntity> {
    return this.updateUser(id, updates);
  }

  deleteUser(id: number): Observable<any> {
  console.log('🔍 UserService.deleteUser llamado');
  console.log('🆔 ID a eliminar:', id, 'Tipo:', typeof id);
  
  if (!id || id <= 0) {
    console.error('❌ ID inválido en UserService:', id);
    return throwError(() => new Error('ID de usuario inválido'));
  }

  const headers = this.getHeaders();
  const url = `${this.apiUrl}/delete/${id}`;
  
  console.log('🌐 URL de eliminación:', url);
  console.log('📋 Headers:', headers.keys());
  
  // Verificar token
  const authHeader = headers.get('Authorization');
  if (!authHeader || authHeader === 'Bearer ') {
    console.error('❌ Token de autorización faltante o inválido');
    return throwError(() => new Error('Token de autorización requerido'));
  }
  
  console.log('🔑 Authorization header:', authHeader.substring(0, 20) + '...');

  return this.http.delete<any>(url, { headers }).pipe(
    tap(response => {
      console.log('✅ Eliminación exitosa - respuesta completa:', response);
    }),
    catchError(error => {
      console.error('❌ Error en deleteUser:', error);
      console.error('📊 Status del error:', error.status);
      console.error('📝 StatusText del error:', error.statusText);
      console.error('🔍 Error body:', error.error);
      console.error('🌐 URL que falló:', error.url);
      
      // Re-lanzar el error para que el componente lo maneje
      return throwError(() => error);
    })
  );
}

  // ✅ Métodos adicionales útiles
  getMyProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('👤 Mi perfil:', response);
        return response;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('🔒 Contraseña cambiada:', response);
        return response;
      })
    );
  }

  getUserSecurityOverview(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/security-overview/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('🔒 Resumen de seguridad:', response);
        return response;
      })
    );
  }

  // ✅ Métodos adicionales para compatibilidad con el AuthService
  findUserByEmail(email: string): Observable<UserEntity[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => user.email === email))
    );
  }

  // ✅ Método para buscar usuarios (útil para administración)
  searchUsers(searchTerm: string): Observable<UserEntity[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
}