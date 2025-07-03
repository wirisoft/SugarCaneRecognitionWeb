// src/app/services/permissions/permissions.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../models/user.entity';
import { RoleName } from '../../models/RoleName';
import { Observable, map, shareReplay, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  
  // ✅ Cache para permisos del usuario
  private permissionsCache$: Observable<{
    user: UserEntity | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isUser: boolean;
    roles: string[];
  }> | null = null;

  // Constantes para los roles (usando string literals tipados)
  private readonly ROLES = {
    ADMIN: 'ADMIN' as const,
    USER: 'USER' as const
  };
  
  // Permisos específicos para el dashboard
  private dashboardPermissions = {
    // Rutas accesibles por USER (solo lectura + su historial)
    userRoutes: [
      '/dashboard/dashboard-home',
      '/dashboard/profile-cana',
      '/dashboard/diagnosis-cana',        // SU historial de detecciones
      '/dashboard/plants-cana',           // Ver plantas (solo lectura)
      '/dashboard/pests-cana',            // Ver plagas (solo lectura)  
      '/dashboard/detections-model-cana'  // Ver modelos (solo lectura)
    ],
    
    // Rutas solo para ADMIN
    adminOnlyRoutes: [
      '/dashboard/users-cana'             // Gestión de usuarios
    ],
    
    // Acciones específicas por recurso
    resources: {
      plants: {
        view: [this.ROLES.USER, this.ROLES.ADMIN],
        create: [this.ROLES.ADMIN],
        update: [this.ROLES.ADMIN],
        delete: [this.ROLES.ADMIN]
      },
      pests: {
        view: [this.ROLES.USER, this.ROLES.ADMIN],
        create: [this.ROLES.ADMIN],
        update: [this.ROLES.ADMIN],
        delete: [this.ROLES.ADMIN]
      },
      detectionModels: {
        view: [this.ROLES.USER, this.ROLES.ADMIN],
        create: [this.ROLES.ADMIN],
        update: [this.ROLES.ADMIN],
        delete: [this.ROLES.ADMIN]
      },
      users: {
        view: [this.ROLES.ADMIN],
        create: [this.ROLES.ADMIN],
        update: [this.ROLES.ADMIN],
        delete: [this.ROLES.ADMIN]
      },
      detectionHistory: {
        viewOwn: [this.ROLES.USER, this.ROLES.ADMIN],       // USER ve solo su historial
        viewAll: [this.ROLES.ADMIN],                        // ADMIN ve todo
        delete: [this.ROLES.ADMIN]
      }
    }
  };

  constructor(private authService: AuthService) {}

  /**
   * ✅ Método principal que cachea los permisos del usuario
   */
  private getPermissionsCache(): Observable<{
    user: UserEntity | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isUser: boolean;
    roles: string[];
  }> {
    if (!this.permissionsCache$) {
      console.log('🚀 Inicializando cache de permisos');
      
      this.permissionsCache$ = this.authService.user$.pipe(
        distinctUntilChanged((prev, curr) => {
          // Solo actualizar si el usuario realmente cambió
          return JSON.stringify(prev) === JSON.stringify(curr);
        }),
        map(user => {
          const roles = user?.roles?.map(role => this.normalizeRoleName(role.name)) || [];
          const isAuthenticated = !!user && !!user.id && user.isActive === true;
          const isAdmin = roles.includes(this.ROLES.ADMIN);
          const isUser = roles.includes(this.ROLES.USER);

          console.log('🔄 Cache actualizado:', {
            userId: user?.id,
            isAuthenticated,
            isAdmin,
            isUser,
            roles
          });

          return {
            user,
            isAuthenticated,
            isAdmin,
            isUser,
            roles
          };
        }),
        shareReplay(1) // ✅ Compartir el último valor entre todas las suscripciones
      );
    }
    
    return this.permissionsCache$;
  }

  /**
   * ✅ Limpiar cache cuando el usuario haga logout
   */
  clearCache(): void {
    console.log('🗑️ Limpiando cache de permisos');
    this.permissionsCache$ = null;
  }

  /**
   * Convierte el rol del backend al formato que usa el frontend
   */
  private normalizeRoleName(backendRoleName: any): string {
    if (typeof backendRoleName === 'string') {
      return backendRoleName;
    }
    
    if (backendRoleName === RoleName.ROLE_USER) {
      return this.ROLES.USER;
    }
    if (backendRoleName === RoleName.ROLE_ADMIN) {
      return this.ROLES.ADMIN;
    }
    
    return String(backendRoleName);
  }

  /**
   * ✅ Verifica si el usuario tiene un rol específico (usando cache)
   */
  hasRole(roleName: string): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.roles.includes(roleName))
    );
  }

  /**
   * ✅ Verifica si el usuario tiene alguno de los roles especificados (usando cache)
   */
  hasAnyRole(roleNames: string[]): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.roles.some(role => roleNames.includes(role)))
    );
  }

  /**
   * ✅ Verifica si es ADMIN (usando cache)
   */
  isAdmin(): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.isAdmin)
    );
  }

  /**
   * ✅ Verifica si es USER (usando cache)
   */
  isUser(): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.isUser)
    );
  }

  /**
   * ✅ Verifica si el usuario está autenticado (usando cache)
   */
  isAuthenticated(): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.isAuthenticated)
    );
  }

  /**
   * ✅ Verifica acceso a rutas del dashboard (usando cache)
   */
  canAccessDashboardRoute(route: string): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated) return false;

        // ADMIN puede acceder a TODO
        if (permissions.isAdmin) return true;

        // USER puede acceder solo a rutas específicas
        if (permissions.isUser) {
          return this.dashboardPermissions.userRoutes.includes(route) ||
                 route.startsWith('/dashboard/dashboard-home');
        }

        return false;
      })
    );
  }

  /**
   * ✅ Verifica si puede realizar una acción específica (usando cache)
   */
  canPerformAction(action: string, resource: string): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated) return false;

        const resourceConfig = this.dashboardPermissions.resources[resource as keyof typeof this.dashboardPermissions.resources];
        
        if (!resourceConfig) return false;

        const allowedRoles = resourceConfig[action as keyof typeof resourceConfig] as string[];
        return allowedRoles ? allowedRoles.some(role => permissions.roles.includes(role)) : false;
      })
    );
  }

  /**
   * ✅ Verifica si puede ver todo el historial (usando cache)
   */
  canViewAllDetectionHistory(): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.isAdmin)
    );
  }

  /**
   * ✅ Verifica si puede acceder a formularios de gestión (usando cache)
   */
  canAccessForms(): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => permissions.isAdmin)
    );
  }

  /**
   * ✅ Obtiene información del usuario para mostrar en la UI (usando cache)
   */
  getCurrentUserInfo(): Observable<{fullName: string, email: string, roles: string[]} | null> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.user) return null;
        
        const user = permissions.user;
        const fullName = `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim();
        
        return {
          fullName,
          email: user.email,
          roles: permissions.roles
        };
      })
    );
  }

  /**
   * ✅ Verifica si el usuario puede ver un recurso específico basado en su ID (usando cache)
   */
  canViewResource(resourceOwnerId: number, resourceType: 'detection' | 'profile'): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated || !permissions.user) return false;
        
        // ADMIN puede ver todo
        if (permissions.isAdmin) return true;
        
        // USER solo puede ver sus propios recursos
        if (permissions.isUser) {
          return permissions.user.id === resourceOwnerId;
        }
        
        return false;
      })
    );
  }

  /**
   * ✅ Obtiene el nivel de acceso del usuario (usando cache)
   */
  getAccessLevel(): Observable<'admin' | 'user' | 'none'> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated) return 'none';
        
        if (permissions.isAdmin) return 'admin';
        if (permissions.isUser) return 'user';
        
        return 'none';
      })
    );
  }

  /**
   * ✅ Verifica si puede eliminar una detección específica (usando cache)
   */
  canDeleteDetection(detectionUserId: number): Observable<boolean> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated || !permissions.user) return false;
        
        // ADMIN puede eliminar cualquier detección
        if (permissions.isAdmin) return true;
        
        // USER solo puede eliminar sus propias detecciones
        if (permissions.isUser) {
          return permissions.user.id === detectionUserId;
        }
        
        return false;
      })
    );
  }

  /**
   * ✅ Obtiene un resumen de permisos para debugging (usando cache)
   */
  getPermissionsSummary(): Observable<any> {
    return this.getPermissionsCache().pipe(
      map(permissions => {
        if (!permissions.isAuthenticated || !permissions.user) {
          return { authenticated: false };
        }
        
        return {
          authenticated: true,
          user: {
            id: permissions.user.id,
            name: `${permissions.user.firstName} ${permissions.user.lastName}`,
            email: permissions.user.email,
            active: permissions.user.isActive
          },
          roles: permissions.roles,
          permissions: {
            isAdmin: permissions.isAdmin,
            isUser: permissions.isUser,
            canManageUsers: permissions.isAdmin,
            canCreatePlants: permissions.isAdmin,
            canViewAllHistory: permissions.isAdmin,
            canAccessForms: permissions.isAdmin
          }
        };
      })
    );
  }

  /**
   * ✅ Método útil para debugging - muestra los roles del usuario (usando cache)
   */
  logCurrentUserRoles(): void {
    this.getPermissionsCache().subscribe(permissions => {
      if (permissions.user) {
        console.log('👤 Usuario actual:', `${permissions.user.firstName} ${permissions.user.lastName}`);
        console.log('🔐 Roles normalizados:', permissions.roles);
        console.log('📧 Email:', permissions.user.email);
        console.log('🆔 ID:', permissions.user.id);
        console.log('📱 Teléfono:', permissions.user.phoneNumber);
        console.log('✅ Activo:', permissions.user.isActive);
        console.log('🔑 Permisos:', {
          isAuthenticated: permissions.isAuthenticated,
          isAdmin: permissions.isAdmin,
          isUser: permissions.isUser
        });
      } else {
        console.log('❌ No hay usuario autenticado');
      }
    });
  }
}