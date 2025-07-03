// src/app/guards/auth.guard.ts (PARA TU APP HÍBRIDA)
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Verificar si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // Verificar si está en proceso de 2FA
    if (this.authService.isWaitingFor2FA) {
      // Si está esperando 2FA y trata de acceder a otra ruta que no sea la de verificación
      if (state.url !== '/landing/two-factor-verification') {
        this.router.navigate(['/landing/two-factor-verification']);
        return false;
      }
      return true;
    }

    // No está autenticado, redirigir al login
    this.router.navigate(['/landing/login-cana'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Solo permitir acceso a la página de 2FA si está esperando verificación
    if (this.authService.isWaitingFor2FA) {
      return true;
    }

    // Si no está esperando 2FA, redirigir al login
    this.router.navigate(['/landing/login-cana']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard/dashboard-home']);
      return false;
    }

    // Si está esperando 2FA, redirigir a la verificación
    if (this.authService.isWaitingFor2FA) {
      this.router.navigate(['/landing/two-factor-verification']);
      return false;
    }

    return true;
  }
}