// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserEntity } from '../models/user.entity'; // Change import from User to UserEntity
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserEntity[]> {
    return this.http.get<UserEntity[]>(`${this.apiUrl}/get-all`);
  }

  getUserById(id: number): Observable<UserEntity> {
    return this.http.get<UserEntity>(`${this.apiUrl}/get/${id}`);
  }

  createUser(user: UserEntity): Observable<UserEntity> {
    return this.http.post<UserEntity>(`${this.apiUrl}/create`, user);
  }

  updateUser(id: number, user: Partial<UserEntity>): Observable<UserEntity> {
    return this.http.put<UserEntity>(`${this.apiUrl}/update/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}