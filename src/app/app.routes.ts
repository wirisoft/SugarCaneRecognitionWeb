import { Routes } from '@angular/router';
import { pageRoutes } from './landing/page-cana-routes';
import { dashboardRoutes } from './dashboard/page-dashboard-routes';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/landing/home-cana',
        pathMatch: 'full'
    },
    ...pageRoutes,
    {
        path: '**',
        redirectTo: '/landing/home-cana',
        pathMatch: 'full'
    },
    {
        path: 'dashboard-home',
        redirectTo: '/dashboard/dashboard-home',
        pathMatch: 'full'
    },
    ...dashboardRoutes  

];
