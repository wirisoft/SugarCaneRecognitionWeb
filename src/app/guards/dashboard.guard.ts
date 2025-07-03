// src/app/guards/dashboard.guard.ts
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PermissionsService } from '../services/permissions/permissions.service';
import { AuthService } from '../services/auth.service';

/**
 * Guard para verificar autenticación en el dashboard
 */
export const dashboardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  
  const permissionsService = inject(PermissionsService);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verificar si está autenticado
  if (!authService.isLoggedIn()) {
    console.log('🚫 Usuario no autenticado, redirigiendo al login');
    router.navigate(['/landing/login-cana']);
    return of(false);
  }
  
  const currentRoute = state.url;
  console.log('🔍 Verificando acceso a:', currentRoute);
  
  // Verificar acceso específico a la ruta del dashboard
  return permissionsService.canAccessDashboardRoute(currentRoute).pipe(
    map(canAccess => {
      if (!canAccess) {
        console.warn(`🚫 Acceso denegado a ${currentRoute}`);
        router.navigate(['/dashboard/dashboard-home']);
        return false;
      }
      console.log('✅ Acceso permitido a:', currentRoute);
      return true;
    }),
    catchError((error) => {
      console.error('❌ Error verificando permisos:', error);
      router.navigate(['/dashboard/dashboard-home']);
      return of(false);
    })
  );
};

/**
 * Guard para rutas que requieren rol ADMIN únicamente
 */
export const adminOnlyGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);
  
  return permissionsService.isAdmin().pipe(
    map(isAdmin => {
      if (!isAdmin) {
        console.warn('🚫 Acceso denegado: Solo administradores pueden acceder a esta ruta');
        router.navigate(['/dashboard/dashboard-home']);
        return false;
      }
      console.log('✅ Acceso de administrador confirmado');
      return true;
    }),
    catchError((error) => {
      console.error('❌ Error verificando rol de administrador:', error);
      router.navigate(['/dashboard/dashboard-home']);
      return of(false);
    })
  );
};

/**
 * Guard para verificar solo autenticación (sin verificar roles específicos)
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    console.log('🚫 Usuario no autenticado, redirigiendo al login');
    router.navigate(['/landing/login-cana']);
    return of(false);
  }
  
  return of(true);
};

/**
 * Guard para rutas públicas (redirige si ya está autenticado)
 */
export const publicGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    console.log('✅ Usuario ya autenticado, redirigiendo al dashboard');
    router.navigate(['/dashboard/dashboard-home']);
    return of(false);
  }
  
  return of(true);
};