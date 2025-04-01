import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserEntity } from '../../../models/user.entity';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SearchService } from '../../../services/search.service';



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
export class NavBarDashboardCanaComponent implements OnInit, OnDestroy{
  isSidebarCollapsed = false;
  currentUser: UserEntity | null = null;
  private userSub!: Subscription;

  searchResults: any = { users: [], plants: [], pests: [] };
  searchTerm: string = '';


  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Cargar usuario inicial desde localStorage
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  
    // Suscribirse a cambios futuros
    this.userSub = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actualizado:', user); // Para debug
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  get userInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  get fullName(): string {
    return this.currentUser 
      ? `${this.currentUser.firstName} ${this.currentUser.lastName}`
      : 'Usuario';
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  

  // En nav-bar-dashboard-cana.component.ts
  onLogout() {
    this.authService.logout();
    localStorage.clear();
    this.router.navigate(['/landing/login-cana']); // Redirección explícita
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
