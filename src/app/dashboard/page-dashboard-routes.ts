import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';

export const dashboardRoutes: Routes = [
    {
        path: 'dashboard',
        children: [
            {
                path: '',
                redirectTo: 'dashboard-home',
                pathMatch: 'full'
            },
            {
                path: 'dashboard-home',
                component: DashboardHomeComponent
            }
        ]
    }
]