import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-bar-dashboard-cana',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './nav-bar-dashboard-cana.component.html',
  styleUrl: './nav-bar-dashboard-cana.component.css'
})
export class NavBarDashboardCanaComponent {
  isSidebarCollapsed = false;
  userName: string = 'Juan Pérez'; // Replace with actual user data
  //userAvatar: string = 'assets/images/mosca_pinta.webp'; // Replace with actual user avatar

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onSearch(searchTerm: string) {
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  }

  onLogout() {
    // Implement logout functionality
    console.log('Logging out...');
  }

  navigateToProfile() {
    // Implement profile navigation
    console.log('Navigating to profile...');
  }

  navigateToSettings() {
    // Implement settings navigation
    console.log('Navigating to settings...');
  }
}
