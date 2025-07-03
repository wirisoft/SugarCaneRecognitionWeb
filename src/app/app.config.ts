// src/app/app.config.ts 
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { httpInterceptor } from './interceptors/http.interceptor';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from "@angular/common/http";


import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

// ✅ Nuevo servicio de permisos
import { PermissionsService } from './services/permissions/permissions.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
    
    // ✅ Servicios existentes
    AuthService,
    UserService,
    
    // ✅ Nuevo servicio de permisos
    PermissionsService
  ],
};