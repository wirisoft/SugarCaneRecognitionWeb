// src/app/app.routes.ts (HÍBRIDO ACTUALIZADO)
import { Routes } from '@angular/router';
import { pageRoutes } from './landing/page-cana-routes';
import { dashboardRoutes } from './dashboard/page-dashboard-routes';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/landing/home-cana',
    pathMatch: 'full'
  },

  // Rutas de landing (páginas públicas)
  ...pageRoutes,

  // Rutas de dashboard (páginas protegidas)
  ...dashboardRoutes,

  // Ruta comodín - debe ir al final
  {
    path: '**',
    redirectTo: '/landing/404-cana'
  }
];