// src/app/dashboard/page-dashboard-routes.ts (ACTUALIZADO)
import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { UsersDashboardCanaComponent } from './users-dashboard-cana/users-dashboard-cana.component';
import { ProfileDashboardCanaComponent } from './profile-dashboard-cana/profile-dashboard-cana.component';
import { PlantsDashboardCanaComponent } from './plants-dashboard-cana/plants-dashboard-cana.component';
import { PestsDashboardCanaComponent } from './pests-dashboard-cana/pests-dashboard-cana.component';
import { DetectionModelDashboardCanaComponent } from './detection-model-dashboard-cana/detection-model-dashboard-cana.component';
import { DiagnosisDashboardCanaComponent } from './diagnosis-dashboard-cana/diagnosis-dashboard-cana.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { dashboardGuard, adminOnlyGuard, authGuard } from '../guards/dashboard.guard';
import { AuthGuard } from '../guards/auth.guard';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';

export const dashboardRoutes: Routes = [
    {
        path: 'dashboard',
        canActivate: [AuthGuard], // ✅ Usar nuestro AuthGuard que maneja 2FA
        children: [
            {
                path: '',
                redirectTo: 'dashboard-home',
                pathMatch: 'full'
            },
            {
                path: 'dashboard-home',
                component: DashboardHomeComponent
                // ✅ Accesible por USER y ADMIN una vez autenticados
            },
            {
                path: 'users-cana',
                component: UsersDashboardCanaComponent,
                canActivate: [adminOnlyGuard] // ⚠️ Solo ADMIN
            },
            {
                path: 'profile-cana',
                component: ProfileDashboardCanaComponent
                // ✅ Accesible por USER y ADMIN
            },
            {
                path: 'plants-cana',
                component: PlantsDashboardCanaComponent
                // ✅ USER: solo lectura, ADMIN: gestión completa
            },
            {
                path: 'pests-cana',
                component: PestsDashboardCanaComponent
                // ✅ USER: solo lectura, ADMIN: gestión completa
            },
            {
                path: 'detections-model-cana',
                component: DetectionModelDashboardCanaComponent
                // ✅ USER: solo lectura, ADMIN: gestión completa
            },
            {
                path: 'diagnosis-cana',
                component: DiagnosisDashboardCanaComponent
                // ✅ USER: su historial, ADMIN: todo el historial
            },
            {
                path: 'security-settings',
                component: SecuritySettingsComponent
                // ✅ Accesible por USER y ADMIN para gestionar su propio 2FA
            },
            {
                path: 'privacy-policy',
                component: PrivacyPolicyComponent
                // ✅ Accesible por USER y ADMIN
            },
            {
                path: 'terms-and-conditions',
                component: TermsAndConditionsComponent
                // ✅ Accesible por USER y ADMIN
            }
        ]
    }
];