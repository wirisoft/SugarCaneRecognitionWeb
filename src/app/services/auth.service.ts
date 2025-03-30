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

  setUser(user: UserEntity) {
    this.userSubject.next(user);
    localStorage.setItem('usuario', JSON.stringify(user));
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
    this.router.navigate(['/login']);
  }
}