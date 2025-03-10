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
    ...dashboardRoutes,
    {
        path: '**',
        redirectTo: '/landing/404-cana',
        pathMatch: 'full'
    },  

];
