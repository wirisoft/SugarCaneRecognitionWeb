import { Routes } from "@angular/router";
import { HomeCanaComponent } from "./home-cana/home-cana.component";
import { ExploreCanaComponent } from "./explore-cana/explore-cana.component";
import { IdentifyCanaComponent } from "./identify-cana/identify-cana.component";
import { LoginCanaComponent } from "./login-cana/login-cana.component";
import { RegisterCanaComponent } from "./register-cana/register-cana.component";


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
                component: LoginCanaComponent
            },
            {
                path: 'register-cana',
                component: RegisterCanaComponent
            }
        ]
    }
]