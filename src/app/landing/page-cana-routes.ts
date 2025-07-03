// src/app/landing/page-cana-routes.ts (ACTUALIZADO)
import { Routes } from "@angular/router";
import { HomeCanaComponent } from "./home-cana/home-cana.component";
import { ExploreCanaComponent } from "./explore-cana/explore-cana.component";
import { IdentifyCanaComponent } from "./identify-cana/identify-cana.component";
import { LoginCanaComponent } from "./login-cana/login-cana.component";
import { RegisterCanaComponent } from "./register-cana/register-cana.component";
import { InfoSectionsComponent } from "./info-sections/info-sections.component";
import { UnderDevelopmentComponent } from "./components/under-development/under-development.component";
import { ErrorCanaComponent } from "./error-cana/error-cana.component";
import { TwoFactorVerificationComponent } from "../dashboard/two-factor-verification/two-factor-verification.component";
import { NoAuthGuard, TwoFactorGuard } from "../guards/auth.guard";

export const pageRoutes: Routes = [
    {
        path: 'landing',
        children: [
            {
                path: '',
                redirectTo: 'home-cana',
                pathMatch: 'full'
            },
            {
                path: 'home-cana',
                component: HomeCanaComponent
            },
            {
                path: 'explore-cana',
                component: ExploreCanaComponent
            },
            {
                path: 'identify-cana',
                component: IdentifyCanaComponent
            },
            {
                path: 'login-cana',
                component: LoginCanaComponent,
                canActivate: [NoAuthGuard] // Solo accesible si NO está autenticado
            },
            {
                path: 'register-cana',
                component: RegisterCanaComponent,
                canActivate: [NoAuthGuard] // Solo accesible si NO está autenticado
            },
            {
                path: 'two-factor-verification',
                component: TwoFactorVerificationComponent,
                canActivate: [TwoFactorGuard] // Solo accesible si está esperando 2FA
            },
            {
                path: 'info-sections',
                component: InfoSectionsComponent
            },
            {
                path: 'under-development',
                component: UnderDevelopmentComponent
            },
            {
                path: '404-cana',
                component: ErrorCanaComponent
            }
        ]
    }
];