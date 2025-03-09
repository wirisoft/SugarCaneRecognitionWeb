import { Component } from '@angular/core';
import { NavBarDashboardCanaComponent } from "../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component";

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [NavBarDashboardCanaComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent {

}
