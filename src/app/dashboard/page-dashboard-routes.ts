import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { UsersDashboardCanaComponent } from './users-dashboard-cana/users-dashboard-cana.component';
import { ProfileDashboardCanaComponent } from './profile-dashboard-cana/profile-dashboard-cana.component';
import { PlantsDashboardCanaComponent } from './plants-dashboard-cana/plants-dashboard-cana.component';
import { PestsDashboardCanaComponent } from './pests-dashboard-cana/pests-dashboard-cana.component';
import { DetectionModelDashboardCanaComponent } from './detection-model-dashboard-cana/detection-model-dashboard-cana.component';

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
            },
            {
                path: 'users-cana',
                component: UsersDashboardCanaComponent
            },
            {
                path: 'profile-cana',
                component: ProfileDashboardCanaComponent
            },
            {
                path: 'plants-cana',
                component: PlantsDashboardCanaComponent
            },
            {
                path: 'pests-cana',
                component: PestsDashboardCanaComponent
            },
            {
                path: 'detections-model-cana',
                component: DetectionModelDashboardCanaComponent
            }

        ]
    }
]