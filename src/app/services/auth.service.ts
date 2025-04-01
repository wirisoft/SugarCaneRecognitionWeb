// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserEntity } from '../models/user.entity';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private userSubject = new BehaviorSubject<UserEntity | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ jwt: string; user: UserEntity }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        if (response && response.jwt) {
          localStorage.setItem('token', response.jwt);
          if (response.user) {
            this.setUser(response.user);
          }
        }
      })
    );
  }

  register(user: Partial<UserEntity>): Observable<any> {
    console.log('Enviando datos de registro al backend:', JSON.stringify(user));
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // En auth.service.ts
setUser(user: UserEntity) {
  this.userSubject.next(user);
  localStorage.setItem('usuario', JSON.stringify(user)); // Asegurar que se guarda correctamente
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.userSubject.next(null);
    this.router.navigate(['/landing/login-cana']);
  }

  // Añade este método en la clase AuthService
  getUser(): UserEntity | null {
    return this.userSubject.value;
  }
  
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // Create a request payload for password change
    const payload = {
      currentPassword,
      newPassword
    };
    
    // You'll need to create an endpoint on your server to handle password changes
    // This could be a dedicated endpoint like /auth/change-password or using the user update endpoint
    return this.http.post(`${this.apiUrl}/change-password`, payload);
  }
}