import { Routes } from '@angular/router';
import { pageRoutes } from './landing/page-cana-routes';

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
    }
];
