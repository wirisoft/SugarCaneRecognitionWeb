import { Routes } from "@angular/router";
import { HomeCanaComponent } from "./home-cana/home-cana.component";


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
            }
        ]
    }
]